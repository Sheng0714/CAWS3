// import React, { useEffect } from 'react';
// import config from '../config.json';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
// import { styled, Card, CardHeader, CardContent, Typography, CardActions, IconButton } from '@mui/material';
// import { Favorite } from '@mui/icons-material';
// import { Button } from '@mui/base';
// import url from '../url.json';
// import { findroomByInfo } from '../utils/findRoomMode';

// const Item = styled(Card)(({ theme }) => ({
//     backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#E3DFFD',
//     ...theme.typography.body2,
//     padding: theme.spacing(2),
//     color: theme.palette.text.secondary,
// }));

// const EnterActivity = styled((props) => {
//     const { expand, ...other } = props;
//     return <IconButton {...other} />;
// })(({ theme }) => ({
//     marginLeft: 'auto',
//     transition: theme.transitions.create('transform', {
//         duration: theme.transitions.duration.shortest,
//     }),
// }));

// const _getActivityInfo_ = async () => await axios.get(url.backendHost +'api/activityInfo/' + localStorage.getItem('activityId')).then((response) => {
//     localStorage.setItem('activityInfo', JSON.stringify(response.data));
//     console.log("getActivityInfo", response);
//     return response
//   });

// export default function ActivityCard({ activity }) {
//     const navigate = useNavigate();
//     const formatTimestamp = (timestamp) => {
//         return new Intl.DateTimeFormat('en-US', {
//             year: 'numeric',
//             month: 'numeric',
//             day: 'numeric',
//             hour: 'numeric',
//             minute: 'numeric',
//             //   second: 'numeric',
//             hour12: false,
//         }).format(new Date(timestamp));
//     };

//     const handleEnter = async (e) => {
//         e.preventDefault();
//         console.log(activity.ActivityGroup.Activity.id, activity.ActivityGroup.GroupId, activity.ActivityGroup.Group.joinCode);

//         const { Activity, Group } = activity.ActivityGroup;

//         localStorage.setItem('activityId', Activity.id);
//         localStorage.setItem('groupId', Group.groupId);
//         localStorage.setItem('joinCode', Group.joinCode);

//         for (let i = 0; i < localStorage.length; i++) {
//             const key = localStorage.key(i);
//             const value = localStorage.getItem(key);
//             sessionStorage.setItem(key, value);
//           }
        
//         _getActivityInfo_()
//         .then((activityInfo) => {
//             navigate(findroomByInfo(activityInfo));
//         })
//         .catch((error) => {
//             console.error(error);
//             navigate("/forum");
//         });
        
          
//     };


//     // console.log(`groupName: ${activity.ActivityGroup.Group.groupName}`);
//     return (
//         <div>
//             <Item>
//                 <CardHeader
//                     title={activity.ActivityGroup.Activity.title}
//                     subheader={activity.ActivityGroup.Group.groupName ?? ''}
//                 />
//                 <CardContent>
//                     <Typography variant="body2" color="text.secondary">
//                         {`${formatTimestamp(activity.ActivityGroup.Activity.startDate)} ~ ${formatTimestamp(activity.ActivityGroup.Activity.endDate)}`}
//                     </Typography>
//                 </CardContent>
//                 <CardActions disableSpacing>
//                     <IconButton aria-label="add to favorites">
//                         <Favorite />
//                     </IconButton>
//                     <EnterActivity>
//                         <Button className='enter-activity-button' onClick={handleEnter}>
//                             �i�J�ҵ{
//                         </Button>
//                     </EnterActivity>
//                 </CardActions>
//             </Item>
//         </div>
//     );

// }





// import React, { useEffect } from 'react';
// import config from '../config.json';
// import axios from "axios";
// import { useNavigate } from 'react-router-dom';
// import { styled, Card, CardHeader, CardContent, Typography, CardActions, IconButton } from '@mui/material';
// import { Favorite } from '@mui/icons-material';
// import { Button } from '@mui/base';
// import url from '../url.json';
// import { findroomByInfo } from '../utils/findRoomMode';
// import MyCreatedActivityCard from './MyCreatedActivityCard';

// const Item = styled(Card)(({ theme }) => ({
//     backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#E3DFFD',
//     ...theme.typography.body2,
//     padding: theme.spacing(2),
//     color: theme.palette.text.secondary,
// }));

// const EnterActivity = styled((props) => {
//     const { expand, ...other } = props;
//     return <IconButton {...other} />;
// })(({ theme }) => ({
//     marginLeft: 'auto',
//     transition: theme.transitions.create('transform', {
//         duration: theme.transitions.duration.shortest,
//     }),
// }));

// const _getActivityInfo_ = async () => await axios.get(url.backendHost +'api/activityInfo/' + localStorage.getItem('activityId')).then((response) => {
//     localStorage.setItem('activityInfo', JSON.stringify(response.data));
//     console.log("getActivityInfo", response);
//     return response
//   });

// export default function ActivityCard({ activity }) {
//     const navigate = useNavigate();
//     const formatTimestamp = (timestamp) => {
//         return new Intl.DateTimeFormat('en-US', {
//             year: 'numeric',
//             month: 'numeric',
//             day: 'numeric',
//             hour: 'numeric',
//             minute: 'numeric',
//             //   second: 'numeric',
//             hour12: false,
//         }).format(new Date(timestamp));
//     };

//     const handleEnter = async (e) => {
//         e.preventDefault();
//         console.log(activity.ActivityGroup.Activity.id, activity.ActivityGroup.GroupId, activity.ActivityGroup.Group.joinCode);

//         const { Activity, Group } = activity.ActivityGroup;

//         localStorage.setItem('activityId', Activity.id);
//         localStorage.setItem('groupId', Group.groupId);
//         localStorage.setItem('joinCode', Group.joinCode);

//         for (let i = 0; i < localStorage.length; i++) {
//             const key = localStorage.key(i);
//             const value = localStorage.getItem(key);
//             sessionStorage.setItem(key, value);
//           }
        
//         _getActivityInfo_()
//         .then((activityInfo) => {
//             navigate(findroomByInfo(activityInfo));
//         })
//         .catch((error) => {
//             console.error(error);
//             // navigate("/forum");
//             navigate("/writing_area");
//         });
        
          
//     };


//     // console.log(`groupName: ${activity.ActivityGroup.Group.groupName}`);
//     return (
//         <div>
//             <Item>
//                 <CardHeader
//                     title={activity.ActivityGroup.Activity.title}
//                     subheader={activity.ActivityGroup.Group.groupName ?? ''}
//                 />
//                 <CardContent>
//                     <Typography variant="body2" color="text.secondary">
//                         {`${formatTimestamp(activity.ActivityGroup.Activity.startDate)} ~ ${formatTimestamp(activity.ActivityGroup.Activity.endDate)}`}
//                     </Typography>
//                 </CardContent>
//                 <CardActions disableSpacing>
//                     <IconButton aria-label="add to favorites">
//                         <Favorite />
//                     </IconButton>
//                     <EnterActivity>
//                         <Button className='enter-activity-button' onClick={handleEnter}>
//                             �i�J�g�@��
//                         </Button>
//                     </EnterActivity>
//                 </CardActions>
//             </Item>
//         </div>
//     );

// }



import React from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { styled, Card, CardHeader, CardContent, Typography } from '@mui/material';
import url from '../url.json';
import { findroomByInfo } from '../utils/findRoomMode';
import hasNotificationIcon from '../assets/有通知.png';
import noNotificationIcon from '../assets/沒通知.png';

const Item = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status }) => ({
    backgroundColor: status === 'completed' ? '#DFEDD7' : '#D1E7FB',
    border: 'none',
    borderRadius: '12px',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: '#000000',
    // color: theme.palette.text.secondary,
    // width: '100%',
    // flex: '1 1 200px',
    maxWidth: '360px',
    minWidth: '200px',
    height: '210px',
    boxSizing: 'border-box',
    position: 'relative',

    '& .MuiCardHeader-title': {
        color: '#000000',
    },
    '& .MuiCardHeader-subheader': {
        color: '#000000',
    },
    '& .MuiTypography-root': {
        color: '#000000',
    },
}));

const _getActivityInfo_ = async () => await axios.get(url.backendHost + 'api/activityInfo/' + localStorage.getItem('activityId')).then((response) => {
    localStorage.setItem('activityInfo', JSON.stringify(response.data));
    console.log("getActivityInfo", response);
    return response;
});

export default function ActivityCard({ activity, status = 'in-progress' }) {
    const navigate = useNavigate();
    const formatTimestamp = (timestamp) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        }).format(new Date(timestamp));
    };

    const handleEnter = async () => {
        console.log(activity.ActivityGroup.Activity.id, activity.ActivityGroup.GroupId, activity.ActivityGroup.Group.joinCode);

        const { Activity, Group } = activity.ActivityGroup;

        localStorage.setItem('activityId', Activity.id);
        localStorage.setItem('groupId', Group.groupId);
        localStorage.setItem('joinCode', Group.joinCode);
        localStorage.setItem('activityTitle', Activity.title);
        localStorage.setItem('groupName', Group.groupName || '');

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            sessionStorage.setItem(key, value);
        }

        _getActivityInfo_()
            .then((activityInfo) => {
                navigate(findroomByInfo(activityInfo));
            })
            .catch((error) => {
                console.error(error);
                navigate('/studentfuntion');
            });
    };

    return (
        <div>
            <Item
                status={status}
                onClick={handleEnter}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEnter();
                    }
                }}
                role="button"
                tabIndex={0}
                sx={{ cursor: 'pointer' }}
            >
                <img
                    src={status === 'in-progress' ? hasNotificationIcon : noNotificationIcon}
                    alt={status === 'in-progress' ? '有通知' : '沒通知'}
                    style={{
                        width: '35px',
                        height: '35px',
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                    }}
                />
                <CardHeader
                    title={activity.ActivityGroup.Activity.title}
                    subheader={activity.ActivityGroup.Group.groupName ?? ''}
                />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        {`${formatTimestamp(activity.ActivityGroup.Activity.startDate)} ~ ${formatTimestamp(activity.ActivityGroup.Activity.endDate)}`}
                    </Typography>
                </CardContent>
            </Item>
        </div>
    );
}

