import config from '../config.json';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
// import IndexPage_Navbar from '../components/IndexPage_Navbar';
import IndexPage_Navbar from '../components/Navbar_Student';
import { JoinActivityForm } from '../components/JoinActivityForm';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import io from 'socket.io-client';
import ActivityCard from '../components/ActivityCard';
import url from '../url.json';

export default function Index() {
  const [activities, setActivities] = useState([]);
  const [ws, setWs] = useState(null);
  const userName = localStorage.getItem('name') || 'User';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inProgressRowRef = useRef(null);
  const completedRowRef = useRef(null);

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
    const amount = isMobile ? 240 : 380;
    rowRef.current.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="home-container" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <IndexPage_Navbar callback_setActivities={setActivities} showJoinActivity={false} />
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '120px',
          paddingRight: '120px',
        }}
      >
        <h1 style={{ textAlign: 'left' }}>{`Welcome back ${userName}!`}</h1>
        <button className="join-activity-button">
          <JoinActivityForm callback_setActivities={setActivities} />
        </button>
      </Box>

      <h2 style={{ textAlign: 'left', paddingLeft: '120px' }}>In Progress</h2>
      <Box style={{ display: 'flex', alignItems: 'center', paddingRight: '120px', paddingLeft: '120px' }}>
        <IconButton aria-label="scroll left" onClick={() => scrollRow(inProgressRowRef, 'left')}>
          <ChevronLeft />
        </IconButton>
        <Box
          ref={inProgressRowRef}
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            flex: 1,
            paddingBottom: '8px',
          }}
        >
        {inProgressActivities.map((activity) => (
          <Box key={activity.id} style={{ flex: '0 0 auto', width: isMobile ? '85%' : '360px' }}>
            <ActivityCard activity={activity} status="in-progress" />
          </Box>
        ))}
        </Box>
        <IconButton aria-label="scroll right" onClick={() => scrollRow(inProgressRowRef, 'right')}>
          <ChevronRight />
        </IconButton>
      </Box>

      <h2 style={{ textAlign: 'left', paddingLeft: '120px', marginTop: '24px' }}>Completed</h2>
      <Box style={{ display: 'flex', alignItems: 'center', paddingRight: '120px', paddingLeft: '120px' }}>
        <IconButton aria-label="scroll left" onClick={() => scrollRow(completedRowRef, 'left')}>
          <ChevronLeft />
        </IconButton>
        <Box
          ref={completedRowRef}
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            flex: 1,
            paddingBottom: '8px',
          }}
        >
        {completedActivities.map((activity) => (
          <Box key={activity.id} style={{ flex: '0 0 auto', width: isMobile ? '85%' : '360px' }}>
            <ActivityCard activity={activity} status="completed" />
          </Box>
        ))}
        </Box>
        <IconButton aria-label="scroll right" onClick={() => scrollRow(completedRowRef, 'right')}>
          <ChevronRight />
        </IconButton>
      </Box>
    </div>
  );
}
