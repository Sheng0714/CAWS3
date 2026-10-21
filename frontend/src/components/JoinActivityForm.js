import config from '../config.json';
import axios from "axios";
import React, { useState } from 'react'
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@mui/material';
import joinTopicIcon from '../assets/JoinTopic.png';
import url from '../utils/urlConfig';
import { ensureStudentTopicInNotion } from '../services/studentTopicService';

export const JoinActivityForm = ({ callback_setActivities }) => {
    const userId = localStorage.getItem('userId'); 
    const [open, setOpen] = React.useState(false);
    const [isJoinCodeFocused, setIsJoinCodeFocused] = React.useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [data, setData] = useState({
        userId: userId,
        joinCode: ""
    });
    
    const handleClickOpen = () => {
        setOpen(true);
    };
  
    const handleClose = () => {
        if (isJoining) return;
        setOpen(false);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setData({
            ...data,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const joinCode = data.joinCode.trim();
        if (isJoining || !joinCode) return;

        setIsJoining(true);
        let hasJoinedTopic = false;
        let shouldReload = false;
        try {
            const groupRes = await axios.put(
                `${url.backendHost + config[5].joinActivity}/${encodeURIComponent(joinCode)}/join`,
                { userId: data.userId }
            );
            hasJoinedTopic = true;

            const fetchData = await axios.get(`${url.backendHost + config[4].myJoinedActivityList}/${data.userId}`);
            const activities = Array.isArray(fetchData.data) ? fetchData.data : [];
            callback_setActivities(activities);
            const joinedActivity = activities.find((activity) =>
                String(activity?.ActivityGroup?.Group?.joinCode || '') === joinCode
            );
            const studentName = ['name', 'username', 'userName']
                .map((key) => localStorage.getItem(key) || sessionStorage.getItem(key))
                .find((value) => String(value || '').trim()) || '';

            await ensureStudentTopicInNotion({
                studentName,
                className: joinedActivity?.ActivityGroup?.Activity?.title || '',
                theme: groupRes?.data?.group?.groupName || joinedActivity?.ActivityGroup?.Group?.groupName || '',
            });

            setOpen(false);
            setData({ userId, joinCode: '' });
            shouldReload = true;
        } catch (error) {
            console.error('Failed to join or save the topic:', error);
            if (hasJoinedTopic) {
                setOpen(false);
                setData({ userId, joinCode: '' });
                alert('You joined the topic, but saving the class/topic to Notion failed. Please enter the topic to retry.');
            } else {
                alert("Failed to join the topic. Please check the invitation code!");
            }
        } finally {
            if (hasJoinedTopic) {
                try {
                    const response = await axios.get(url.backendHost + config[1].reNewTokenUrl);
                    const token = response?.data?.jwtToken || response?.data?.token;
                    if (token) localStorage.setItem('jwtToken', token);
                } catch (error) {
                    console.warn('Token renew failed:', error);
                }
            }
            setIsJoining(false);
        }
        if (shouldReload) {
            alert('Successfully joined the topic!');
            window.location.reload();
        }
    };
  
    return (
      <div>
        <>
            <button
                type="button"
                onClick={handleClickOpen}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    textAlign: 'center'
                }}
            >
                <img
                    src={joinTopicIcon}
                    alt="Join Topic"
                    style={{ width: '35px', height: '35px' }}
                />
                <span style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
                    JOIN TOPIC
                </span>
            </button>
        </>
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: '400px',
                    maxWidth: '92vw',
                    minHeight: '300px',
                    backgroundColor: '#fff2e7'
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                }}
            >
                <span style={{ fontSize: '24px', fontWeight: 700 }}>JOIN TOPIC</span>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
                <DialogContentText sx={{ mb: 2, textAlign: 'center', color: '#000' }}>
                    Please ask your teacher for the topic invitation code.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label={isJoinCodeFocused ? "" : "Please enter the invitation code"}
                    type="text"
                    name='joinCode'
                    value={data.joinCode}
                    disabled={isJoining}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        sx: {
                            '& input': {
                                textAlign: 'center'
                            }
                        }
                    }}
                    InputLabelProps={{
                        sx: {
                            width: '100%',
                            textAlign: 'center'
                        }
                    }}
                    onFocus={() => setIsJoinCodeFocused(true)}
                    onBlur={() => setIsJoinCodeFocused(false)}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', pb: 2, px: 3 }}>
                <Button type='submit' onClick={handleSubmit} disabled={isJoining || !data.joinCode.trim()}>
                    {isJoining ? 'Joining...' : 'Join'}
                </Button>
            </DialogActions>
        </Dialog>
      </div>
    );
}
