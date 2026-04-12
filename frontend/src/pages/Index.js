import config from '../config.json';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
// import IndexPage_Navbar from '../components/IndexPage_Navbar';
import IndexPage_Navbar from '../components/Navbar_Student';
import { JoinActivityForm } from '../components/JoinActivityForm';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import io from 'socket.io-client';
import ActivityCard from '../components/ActivityCard';
import url from '../url.json';
import { fetchGradedStatus } from '../services/essayNotificationService';
import teacherAvatar from '../assets/teacher.png';

const READ_NOTIFICATION_STORAGE_KEY = 'readNotificationMap_v1';

const resolveStudentName = () =>
  localStorage.getItem('name') ||
  localStorage.getItem('username') ||
  localStorage.getItem('userName') ||
  '';

const buildActivityKey = (activity) => {
  const activityId = activity?.ActivityGroup?.Activity?.id || '';
  const groupId = activity?.ActivityGroup?.Group?.groupId || activity?.ActivityGroup?.Group?.id || '';
  return `${activityId}::${groupId}`;
};

const readNotificationMapFromStorage = () => {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('Failed to parse read notification map from storage:', error);
    return {};
  }
};

export default function Index() {
  const [activities, setActivities] = useState([]);
  const [notificationMap, setNotificationMap] = useState({});
  const [readNotificationMap, setReadNotificationMap] = useState(readNotificationMapFromStorage);
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    loading: false,
    className: '',
    topicName: '',
    hasNotification: false,
    message: '',
  });
  const [ws, setWs] = useState(null);
  const userName = localStorage.getItem('name') || 'User';
  const studentName = resolveStudentName();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const inProgressRowRef = useRef(null);
  const completedRowRef = useRef(null);
  const horizontalPadding = isMobile ? '16px' : isTablet ? '32px' : '120px';
  const getReadNotificationKey = (activityKey) => `${studentName || 'anonymous'}::${activityKey}`;

  useEffect(() => {
    localStorage.setItem(READ_NOTIFICATION_STORAGE_KEY, JSON.stringify(readNotificationMap));
  }, [readNotificationMap]);

  const connectWebSocket = () => {
    setWs(io(url.backendHost));
  };

  useEffect(() => {
    const getActivities = async () => {
      try {
        const fetchData = await axios.get(
          `${url.backendHost + config[4].myJoinedActivityList}/${localStorage.getItem('userId')}`
        );
        setActivities(fetchData.data);
        console.log('fetchData: ', fetchData.data);
      } catch (err) {
        // console.log(err);
      }
    };
    getActivities();

    if (ws) {
      initWebSocket();
    }
  }, [ws]);

  useEffect(() => {
    let isMounted = true;

    const loadNotificationMap = async () => {
      if (!studentName || !Array.isArray(activities) || activities.length === 0) {
        if (isMounted) {
          setNotificationMap({});
        }
        return;
      }

      const statusEntries = await Promise.all(
        activities.map(async (activity) => {
          const className = activity?.ActivityGroup?.Activity?.title || '';
          const topicName = activity?.ActivityGroup?.Group?.groupName || '';
          const key = buildActivityKey(activity);

          if (!className || !topicName) {
            return [key, false];
          }

          try {
            const hasNotification = await fetchGradedStatus({
              studentName,
              className,
              theme: topicName,
            });
            const isRead = key ? Boolean(readNotificationMap[getReadNotificationKey(key)]) : false;
            return [key, hasNotification && !isRead];
          } catch (error) {
            console.error('Failed to load notification status:', error);
            return [key, false];
          }
        })
      );

      if (!isMounted) return;

      const nextMap = {};
      statusEntries.forEach(([key, value]) => {
        if (key) {
          nextMap[key] = value;
        }
      });
      setNotificationMap(nextMap);
    };

    void loadNotificationMap();

    return () => {
      isMounted = false;
    };
  }, [activities, studentName, readNotificationMap]);

  const initWebSocket = () => {
    ws.on('connect', () => {
      // console.log(ws.id);
    });

    ws.on('event02', (arg, callback) => {
      // console.log(arg);
      callback({
        status: 'event02 ok',
      });
    });
  };

  const isCompletedActivity = (activity) => {
    const endDate = activity?.ActivityGroup?.Activity?.endDate;
    if (!endDate) return false;

    const parsedEndDate = new Date(endDate);
    if (Number.isNaN(parsedEndDate.getTime())) return false;

    return parsedEndDate < new Date();
  };

  const inProgressActivities = activities.filter((activity) => !isCompletedActivity(activity));
  const completedActivities = activities.filter((activity) => isCompletedActivity(activity));

  const scrollRow = (rowRef, direction) => {
    if (!rowRef.current) return;
    const amount = isMobile ? 220 : isTablet ? 300 : 380;
    rowRef.current.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  const closeNotificationDialog = () => {
    setNotificationDialog((prev) => ({ ...prev, open: false }));
  };

  const handleNotificationClick = async ({ activity, className, topicName }) => {
    const key = buildActivityKey(activity);
    const readKey = getReadNotificationKey(key);
    const normalizedClassName = className || '';
    const normalizedTopicName = topicName || '';

    setNotificationDialog({
      open: true,
      loading: true,
      className: normalizedClassName,
      topicName: normalizedTopicName,
      hasNotification: false,
      message: '',
    });

    if (!studentName || !normalizedClassName || !normalizedTopicName) {
      setNotificationMap((prev) => ({ ...prev, [key]: false }));
      setNotificationDialog({
        open: true,
        loading: false,
        className: normalizedClassName,
        topicName: normalizedTopicName,
        hasNotification: false,
        message: 'No new notification for this class topic yet.',
      });
      return;
    }

    try {
      const graded = await fetchGradedStatus({
        studentName,
        className: normalizedClassName,
        theme: normalizedTopicName,
      });

      if (graded && key) {
        setReadNotificationMap((prev) => ({ ...prev, [readKey]: true }));
      }

      setNotificationMap((prev) => ({ ...prev, [key]: false }));
      setNotificationDialog({
        open: true,
        loading: false,
        className: normalizedClassName,
        topicName: normalizedTopicName,
        hasNotification: graded,
        message: graded
          ? "Your essay has been graded! You can check your teacher's comments and score in Scoring & Feedback."
          : 'No new notification for this class topic yet.',
      });
    } catch (error) {
      console.error('Failed to load notification status:', error);
      setNotificationDialog({
        open: true,
        loading: false,
        className: normalizedClassName,
        topicName: normalizedTopicName,
        hasNotification: false,
        message: 'Unable to load notifications right now. Please try again later.',
      });
    }
  };

  return (
    <div className="home-container" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', height: 'auto' }}>
      <IndexPage_Navbar callback_setActivities={setActivities} showJoinActivity={false} />
      <Box
        style={{
          display: 'flex',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '0',
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
          paddingTop: isMobile ? '8px' : '0',
        }}
      >
        <h1 style={{ textAlign: 'left', fontSize: isMobile ? '26px' : '32px' }}>{`Welcome back ${userName}!`}</h1>
         <button
          className="join-activity-button"
          style={{
            marginRight: 0,
            width: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? '16px' : '20px',
            padding: isMobile ? '0.75rem 1rem' : '0.9rem 1.75rem',
          }}
        >
          <JoinActivityForm callback_setActivities={setActivities} />
        </button>
      </Box>

      <h2 style={{ textAlign: 'left', paddingLeft: horizontalPadding, paddingRight: horizontalPadding }}>In Progress</h2>
      <Box style={{ display: 'flex', alignItems: 'center', paddingRight: horizontalPadding, paddingLeft: horizontalPadding }}>
        {!isMobile && (
          <IconButton aria-label="scroll left" onClick={() => scrollRow(inProgressRowRef, 'left')}>
            <ChevronLeft />
          </IconButton>
        )}
        <Box
          ref={inProgressRowRef}
          style={{
            display: 'flex',
            gap: isMobile ? '12px' : '24px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            flex: 1,
            paddingBottom: '8px',
          }}
        >
        {inProgressActivities.map((activity) => (
          <Box
            key={activity.id}
            style={{
              flex: '0 0 auto',
              width: isMobile ? 'min(85vw, 320px)' : isTablet ? '320px' : '360px',
            }}
          >
            <ActivityCard
              activity={activity}
              status="in-progress"
              hasNotification={Boolean(notificationMap[buildActivityKey(activity)])}
              onNotificationClick={handleNotificationClick}
            />
          </Box>
        ))}
        </Box>
        {!isMobile && (
          <IconButton aria-label="scroll right" onClick={() => scrollRow(inProgressRowRef, 'right')}>
            <ChevronRight />
          </IconButton>
        )}
      </Box>

      <h2 style={{ textAlign: 'left', paddingLeft: horizontalPadding, paddingRight: horizontalPadding, marginTop: '24px' }}>Completed</h2>
      <Box style={{ display: 'flex', alignItems: 'center', paddingRight: horizontalPadding, paddingLeft: horizontalPadding }}>
        {!isMobile && (
          <IconButton aria-label="scroll left" onClick={() => scrollRow(completedRowRef, 'left')}>
            <ChevronLeft />
          </IconButton>
        )}
        <Box
          ref={completedRowRef}
          style={{
            display: 'flex',
            gap: isMobile ? '12px' : '24px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            flex: 1,
            paddingBottom: '8px',
          }}
        >
        {completedActivities.map((activity) => (
          <Box
            key={activity.id}
            style={{
              flex: '0 0 auto',
              width: isMobile ? 'min(85vw, 320px)' : isTablet ? '320px' : '360px',
            }}
          >
            <ActivityCard
              activity={activity}
              status="completed"
              hasNotification={Boolean(notificationMap[buildActivityKey(activity)])}
              onNotificationClick={handleNotificationClick}
            />
          </Box>
        ))}
        </Box>
        {!isMobile && (
          <IconButton aria-label="scroll right" onClick={() => scrollRow(completedRowRef, 'right')}>
            <ChevronRight />
          </IconButton>
        )}
      </Box>

      <Dialog
        open={notificationDialog.open}
        onClose={closeNotificationDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1.5px solid #000000',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Notifications</DialogTitle>
        <DialogContent dividers sx={{ minHeight: '190px' }}>
          {notificationDialog.loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                minHeight: '90px',
              }}
            >
              <CircularProgress size={24} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Checking notification...</span>
            </Box>
          ) : (
            <Box
              sx={{
                border: '1.5px solid #D1D5DB',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box
                sx={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                  flex: '0 0 auto',
                }}
              />
              <Box
                component="img"
                src={teacherAvatar}
                alt="Teacher avatar"
                sx={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flex: '0 0 auto',
                }}
              />
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5, fontWeight: 700 }}>
                  {notificationDialog.message}
                </p>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
