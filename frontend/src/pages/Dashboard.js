import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import NavbarStudent from '../components/Navbar_Student';
import config from '../config.json';
import url from '../url.json';

const FALLBACK_CLASSES = [
  { value: '701', label: 'Class 701' },
  { value: '702', label: 'Class 702' },
  { value: '703', label: 'Class 703' },
  { value: '704', label: 'Class 704' },
];

const TOPIC_OPTIONS = [
  { value: 'argumentation', label: 'Argumentative Writing' },
  { value: 'science', label: 'Scientific Inquiry' },
  { value: 'society', label: 'Social Issues' },
  { value: 'media', label: 'Media Literacy' },
];

const TASK_LABELS = ['Topic Understanding', 'Research Collection', 'Group Discussion', 'Argument Building', 'Presentation'];
const TREND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const scoreFromKey = (key) => {
  return key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const dedupeOptionsByValue = (options) => {
  return Array.from(new Map(options.map((option) => [option.value, option])).values());
};

const getFallbackClassOptions = () => {
  const rawValue = localStorage.getItem('groupIds');
  if (!rawValue) {
    return FALLBACK_CLASSES;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return FALLBACK_CLASSES;
    }

    const options = parsed.map((item, index) => {
      if (item && typeof item === 'object') {
        const value = String(item.id ?? item.groupId ?? index + 1);
        const label = item.name || item.className || `Class ${value}`;
        return { value, label };
      }

      const value = String(item);
      return { value, label: `Class ${value}` };
    });

    const uniqueOptions = dedupeOptionsByValue(options);
    return uniqueOptions.length > 0 ? uniqueOptions : FALLBACK_CLASSES;
  } catch (error) {
    return FALLBACK_CLASSES;
  }
};

const buildAuthConfig = () => {
  const jwtToken = localStorage.getItem('jwtToken');
  if (!jwtToken) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };
};

const buildPathCandidates = (apiBaseUrl, path) => {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  const withoutApiPrefix = normalizedPath.replace(/^api\/+/i, '');
  const withApiPrefix = normalizedPath.toLowerCase().startsWith('api/') ? normalizedPath : `api/${normalizedPath}`;
  const rawCandidates = [withApiPrefix, normalizedPath, withoutApiPrefix];
  return [...new Set(rawCandidates.filter(Boolean).map((item) => `${apiBaseUrl}${item}`))];
};

const requestWithFallback = async ({ method, path, data, apiBaseUrl }) => {
  const candidates = buildPathCandidates(apiBaseUrl, path);
  let lastError = null;

  for (const endpoint of candidates) {
    try {
      return await axios({
        method,
        url: endpoint,
        data,
        ...buildAuthConfig(),
      });
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error(`No API endpoint candidates available for path: ${path}`);
};

const buildClassData = (classOption, topicOption) => {
  const seed = scoreFromKey(`${classOption.value}-${topicOption.value}`);
  const students = 24 + (seed % 11);
  const activeStudents = Math.min(students, Math.floor(students * (0.72 + ((seed % 12) / 100))));
  const completedTasks = 8 + (seed % 7);
  const pendingTasks = 3 + (seed % 4);
  const submittedHomework = Math.min(students, Math.floor(students * (0.58 + ((seed % 27) / 100))));
  const unsubmittedHomework = students - submittedHomework;
  const submissionRate = Math.round((submittedHomework / students) * 100);

  const completionRates = TASK_LABELS.map((task, index) => {
    const value = 55 + ((seed + index * 11) % 42);
    return { task, value };
  });

  const participationTrend = TREND_DAYS.map((day, index) => {
    const value = 42 + ((seed + index * 9) % 50);
    return { day, value };
  });

  const watchList = [
    { name: 'Student Lin', issue: 'Missed 2 homework submissions', action: 'Arrange after-class make-up submission' },
    { name: 'Student Chen', issue: 'Low discussion participation', action: 'Assign a speaking role in group work' },
    { name: 'Student Wang', issue: 'Incorrect citation format', action: 'Provide citation format guidance' },
    { name: 'Student Chang', issue: 'Weak argument linkage', action: 'Provide a sample argument framework' },
  ];

  const focusIndex = seed % watchList.length;

  return {
    summary: {
      students,
      activeStudents,
      activeRate: Math.round((activeStudents / students) * 100),
      completedTasks,
      pendingTasks,
      avgScore: 74 + (seed % 18),
      submittedHomework,
      unsubmittedHomework,
      submissionRate,
    },
    completionRates,
    participationTrend,
    watchList: [
      watchList[focusIndex],
      watchList[(focusIndex + 1) % watchList.length],
      watchList[(focusIndex + 2) % watchList.length],
    ],
  };
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '20px',
  border: '1px solid #e8edf3',
  boxShadow: '0 8px 24px rgba(17, 43, 73, 0.08)',
};

const blockTitleStyle = {
  margin: 0,
  fontSize: '20px',
  color: '#133A5A',
  fontWeight: 700,
  textAlign: 'center',
};

export default function Dashboard() {
  const fallbackClasses = useMemo(() => getFallbackClassOptions(), []);
  const [classOptions, setClassOptions] = useState(fallbackClasses);
  const [topicsByClass, setTopicsByClass] = useState(() => {
    const map = {};
    fallbackClasses.forEach((classOption) => {
      map[classOption.value] = TOPIC_OPTIONS;
    });
    return map;
  });

  const [selectedClass, setSelectedClass] = useState(fallbackClasses[0].value);
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_OPTIONS[0].value);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState('');

  const apiBaseUrl = useMemo(
    () => (url.backendHost.endsWith('/') ? url.backendHost : `${url.backendHost}/`),
    []
  );

  useEffect(() => {
    const fetchTeacherCreatedFilters = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }

      setIsFilterLoading(true);
      setFilterError('');

      try {
        const response = await requestWithFallback({
          method: 'get',
          path: `${config[13].MyCreatedActivity}/${userId}`,
          apiBaseUrl,
        });

        const activities = Array.isArray(response.data) ? response.data : [];
        if (activities.length === 0) {
          return;
        }

        const parsedClasses = [];
        const parsedTopicsByClass = {};

        activities.forEach((activity, index) => {
          const classValue = String(activity.id ?? index + 1);
          const classLabel = activity.title || `Class ${classValue}`;

          parsedClasses.push({ value: classValue, label: classLabel });

          const groups = Array.isArray(activity.Groups) ? activity.Groups : [];
          const topicOptions = groups.map((group, groupIndex) => {
            const topicValue = String(group.id ?? `${classValue}-${groupIndex + 1}`);
            const topicLabel = group.groupName || `Topic ${groupIndex + 1}`;
            return { value: topicValue, label: topicLabel };
          });

          parsedTopicsByClass[classValue] = topicOptions.length > 0
            ? dedupeOptionsByValue(topicOptions)
            : [{ value: `${classValue}-default-topic`, label: 'Untitled Topic' }];
        });

        const uniqueClassOptions = dedupeOptionsByValue(parsedClasses);
        if (uniqueClassOptions.length > 0) {
          setClassOptions(uniqueClassOptions);
          setTopicsByClass(parsedTopicsByClass);
          setSelectedClass((prev) => {
            if (uniqueClassOptions.some((option) => option.value === prev)) {
              return prev;
            }
            return uniqueClassOptions[0].value;
          });
        }
      } catch (error) {
        console.error('Failed to load teacher-created filter data:', error);
        setFilterError('Failed to load teacher-created classes/topics. Fallback data is being used.');
      } finally {
        setIsFilterLoading(false);
      }
    };

    fetchTeacherCreatedFilters();
  }, [apiBaseUrl]);

  const topicOptions = useMemo(() => {
    const options = topicsByClass[selectedClass];
    if (Array.isArray(options) && options.length > 0) {
      return options;
    }
    return TOPIC_OPTIONS;
  }, [topicsByClass, selectedClass]);

  useEffect(() => {
    if (!topicOptions.some((option) => option.value === selectedTopic)) {
      setSelectedTopic(topicOptions[0].value);
    }
  }, [topicOptions, selectedTopic]);

  const selectedClassOption = classOptions.find((option) => option.value === selectedClass) || classOptions[0];
  const selectedTopicOption = topicOptions.find((option) => option.value === selectedTopic) || topicOptions[0];

  const classData = useMemo(
    () => buildClassData(selectedClassOption, selectedTopicOption),
    [selectedClassOption, selectedTopicOption]
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F6FAFF 0%, #F9F6F1 100%)' }}>
      <NavbarStudent />

      <main style={{ padding: '24px clamp(16px, 4vw, 48px) 36px' }}>
        <section
          style={{
            ...cardStyle,
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '30px', color: '#0F2B46' }}>Student Dashboard</h1>
            <p style={{ margin: '8px 0 0', color: '#4B6177' }}>Track class progress, task completion, and participation status.</p>
            {isFilterLoading && (
              <p style={{ margin: '8px 0 0', color: '#5B7087', fontSize: '13px' }}>
                Loading teacher-created classes and topics...
              </p>
            )}
            {!isFilterLoading && filterError && (
              <p style={{ margin: '8px 0 0', color: '#B45309', fontSize: '13px' }}>{filterError}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="class-filter" style={{ fontWeight: 700, color: '#1F4060' }}>
                Class
              </label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
                style={{
                  minWidth: '170px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid #cdd8e6',
                  padding: '0 12px',
                  fontSize: '15px',
                  color: '#1B314A',
                  backgroundColor: '#fff',
                }}
              >
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="topic-filter" style={{ fontWeight: 700, color: '#1F4060' }}>
                Topic
              </label>
              <select
                id="topic-filter"
                value={selectedTopic}
                onChange={(event) => setSelectedTopic(event.target.value)}
                style={{
                  minWidth: '170px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid #cdd8e6',
                  padding: '0 12px',
                  fontSize: '15px',
                  color: '#1B314A',
                  backgroundColor: '#fff',
                }}
              >
                {topicOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gap: '18px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          <article style={cardStyle}>
            <h2 style={blockTitleStyle}>Class Overview</h2>
            <div
              style={{
                marginTop: '14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              <div style={{ background: '#ECF5FF', borderRadius: '12px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#40607D', fontSize: '13px' }}>Total Students</p>
                <strong style={{ fontSize: '28px', color: '#173F63' }}>{classData.summary.students}</strong>
              </div>
              <div style={{ background: '#F6F1FF', borderRadius: '12px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#40607D', fontSize: '13px' }}>Active Students</p>
                <strong style={{ fontSize: '28px', color: '#173F63' }}>{classData.summary.activeStudents}</strong>
              </div>
              <div style={{ background: '#FFF6E9', borderRadius: '12px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#40607D', fontSize: '13px' }}>Average Score</p>
                <strong style={{ fontSize: '28px', color: '#173F63' }}>{classData.summary.avgScore}</strong>
              </div>
              <div style={{ background: '#EDF9F2', borderRadius: '12px', padding: '12px' }}>
                <p style={{ margin: 0, color: '#40607D', fontSize: '13px' }}>Activity Rate</p>
                <strong style={{ fontSize: '28px', color: '#173F63' }}>{classData.summary.activeRate}%</strong>
              </div>
            </div>
          </article>

          <article style={cardStyle}>
            <h2 style={blockTitleStyle}>Homework Submission Rate</h2>
            <div style={{ marginTop: '14px', display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: `conic-gradient(#2F80ED 0% ${classData.summary.submissionRate}%, #E8EEF7 ${classData.summary.submissionRate}% 100%)`,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1A3A5A',
                  }}
                >
                  {classData.summary.submissionRate}%
                </div>
              </div>

              <div style={{ display: 'grid', gap: '8px', minWidth: '180px' }}>
                <div style={{ color: '#294865', fontSize: '15px' }}>
                  <span style={{ color: '#2F80ED', fontWeight: 700 }}>Submitted:</span>
                  {` ${classData.summary.submittedHomework} students`}
                </div>
                <div style={{ color: '#294865', fontSize: '15px' }}>
                  <span style={{ color: '#6D7F93', fontWeight: 700 }}>Unsubmitted:</span>
                  {` ${classData.summary.unsubmittedHomework} students`}
                </div>
                <div style={{ color: '#4E6377', fontSize: '13px' }}>Current homework submission progress for topic "{selectedTopicOption.label}"</div>
              </div>
            </div>
          </article>

          <article style={cardStyle}>
            <h2 style={blockTitleStyle}>Weekly Participation Trend</h2>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-end', gap: '12px', minHeight: '170px' }}>
              {classData.participationTrend.map((item) => (
                <div key={item.day} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${item.value * 1.4}px`,
                      minHeight: '36px',
                      borderRadius: '10px 10px 4px 4px',
                      background: 'linear-gradient(180deg, #FFB86A 0%, #FF8E53 100%)',
                    }}
                    title={`${item.value}%`}
                  />
                  <div style={{ marginTop: '8px', color: '#2C4A65', fontWeight: 700 }}>{item.day}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: '12px 0 0', color: '#4E6377', fontSize: '13px' }}>
              Class "{selectedClassOption.label}" average participation for "{selectedTopicOption.label}" this week is about{' '}
              {Math.round(classData.participationTrend.reduce((acc, item) => acc + item.value, 0) / classData.participationTrend.length)}%
            </p>
          </article>

          <article style={cardStyle}>
            <h2 style={blockTitleStyle}>Students Needing Attention</h2>
            <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
              {classData.watchList.map((student) => (
                <div
                  key={student.name + student.issue}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e6ecf3',
                    padding: '12px',
                    backgroundColor: '#FCFDFE',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ color: '#173F63', fontSize: '16px' }}>{student.name}</strong>
                    <span style={{ color: '#6A8096', fontSize: '12px' }}>Priority Watch</span>
                  </div>
                  <p style={{ margin: '8px 0 4px', color: '#2D4A64', fontSize: '14px' }}>{student.issue}</p>
                  <p style={{ margin: 0, color: '#5C7187', fontSize: '13px' }}>Suggestion: {student.action}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
