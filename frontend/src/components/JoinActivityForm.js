import config from '../config.json';
import axios from "axios";
import React, { useState } from 'react'
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@mui/material';
import joinTopicIcon from '../assets/JoinTopic.png';
import url from '../url.json';

export const JoinActivityForm = ({ callback_setActivities }) => {
    const userId = localStorage.getItem('userId'); 
    const [open, setOpen] = React.useState(false);
    const [isJoinCodeFocused, setIsJoinCodeFocused] = React.useState(false);
    const [data, setData] = useState({
        userId: userId,
        joinCode: ""
    });
    const [activityData, setActivityData] = useState({
        ActivityGroup:{
            Activity: {
                createdAt: '',
                endDate: '',
                title: ''
            },
            Group: {
                groupName: ''
            }
        }
    })
    
    const handleClickOpen = () => {
        setOpen(true);
    };
  
    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setData({
            ...data,
            [e.target.name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const activityData = {
            userId: data.userId,
        };
        axios
            .put(`${url.backendHost + config[5].joinActivity}/${data.joinCode}/join`, activityData)
            .then((groupRes) => {

                axios.get(`${url.backendHost + config[4].myJoinedActivityList}/${data.userId}`).then((fetchData)=>{
                    callback_setActivities(fetchData.data);
                    console.log(`fetchdata-response: ${fetchData.data}`);
                    setOpen(false);
                    setData({
                        userId: userId,
                        joinCode: ""
                    });

                    // renew token
                    axios.get(url.backendHost + config[1].reNewTokenUrl)
                    
                    // console.log('加入活動成功~🎉');
                    alert("Successfully joined the topic!");
                    window.location.reload();
                    
                  }).catch((error) => {
                        alert("取得主題失敗...");
                  })
            })
            .catch((error) => {
                alert("Failed to join the topic. Please check the invitation code!");
                if (error.response) {
                    // console.log(error.response);
                    // console.log("server responded");
                } else if (error.request) {
                    // console.log("network error");
                } else {
                    // console.log(error);
                }
            });
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
                <Button type='submit' onClick={handleSubmit}>Join</Button>
            </DialogActions>
        </Dialog>
      </div>
    );
}
