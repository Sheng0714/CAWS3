import React, { useEffect, useState, useRef, useContext } from "react"; 
import axios from "axios";
import config from "../config.json";
import io from "socket.io-client";
import ForumPage_Navbar from "../components/ForumPage_Navbar";
import Graph from "react-vis-network-graph";
import { ViewNode } from "../components/ViewNode";
import url from "../utils/urlConfig";
import { genEdge, genNode } from "../utils/ideaTool";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { getPinnedNodes, setPinnedNode, removePinnedNode } from "../utils/pinnedNodes"; // 新增
import { ModeContext } from "../contexts/ModeContext";
import AnnouncementPopup from '../components/AnnouncementPopup';
import CallComponent from '../components/CallComponent';



export default function Forum({ showNavbar = true }) {
    const activityInfo = JSON.parse(localStorage.getItem('activityInfo'));
    const [graph, setGraph] = useState({
        nodes: [],
        edges: [],
    });
    const [graphKey, setGraphKey] = useState(0); // 用於強制刷新圖表
    const { isMapBoard } = useContext(ModeContext);
    const [open, setOpen] = useState(false);
    const [nodeContent, setNodeContent] = useState(null);
    const [ws, setSocket] = useState(null);
    const activityId = sessionStorage.getItem("activityId");
    const networkRef = useRef(null);
    const location = useLocation();
    const [timeFilter, setTimeFilter] = useState(0); // 預設為 0，表示不篩選
    const [groupFilter, setGroupFilter] = useState('all');
    const [allNodes, setAllNodes] = useState([]);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [keywordFilter, setKeywordFilter] = useState(''); 

    const handleKeywordFilterChange = (event) => {
        const keyword = event.target.value.trim(); // 移除多餘空格
        setKeywordFilter(keyword);
    
        const filteredNodes = filterNodes(allNodes, timeFilter, groupFilter, keyword);
        console.log('關鍵字篩選條件:', keyword);
        console.log('篩選後的節點:', filteredNodes);
    
        setGraph({
            nodes: filteredNodes,
            edges: graph.edges,
        });
        setGraphKey(prevKey => prevKey + 1); // 更新 graphKey，強制刷新圖表
    };
    

    
    
    // 切換篩選視窗
    const toggleFilterPopup = () => {
        setFilterPopupVisible(!isFilterPopupVisible);
    };
    // 新增 groupId 作為狀態變量
    const [groupId, setGroupId] = useState(sessionStorage.getItem('groupId'));
    const [pinnedNodes, setPinnedNodes] = useState(getPinnedNodes());

    // 獲取當前小組的釘選節點 ID
    const getCurrentPinnedNodeId = () => {
        return pinnedNodes[groupId] || null;
    };

    const [pinnedNodeId, setPinnedNodeId] = useState(getCurrentPinnedNodeId());

    // 當 groupId 或 pinnedNodes 改變時，更新 pinnedNodeId
    useEffect(() => {
        setPinnedNodeId(getCurrentPinnedNodeId());
        // 更新圖表中的節點顏色
        setGraph(prevGraph => ({
            ...prevGraph,
            nodes: prevGraph.nodes.map(node => ({
                ...node,
            })),
        }));
    }, [groupId, pinnedNodes]);

    // 監聽釘選節點的更新
    useEffect(() => {
        const handlePinnedNodeUpdate = () => {
            const updatedPinnedNodes = getPinnedNodes();
            setPinnedNodes(updatedPinnedNodes);
        };

        window.addEventListener('pinnedNodeUpdated', handlePinnedNodeUpdate);

        return () => {
            window.removeEventListener('pinnedNodeUpdated', handlePinnedNodeUpdate);
        };
    }, []);

    // 移除在初次加載或篩選時自動聚焦到釘選節點的邏輯
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const focusNode = params.get('focusNode');
        if (focusNode && networkRef.current) {
            networkRef.current.focus(focusNode, { scale: 1.5, offset: { x: 0, y: 0 } });
        }
    }, [location]);

    // 新增的 handleViewPinned 函數
    const handleViewPinned = () => {
        if (pinnedNodeId) {
            const nodeId = String(pinnedNodeId);
            const pinnedNode = graph.nodes.find(node => String(node.id) === nodeId);
            console.log('釘選的節點:', pinnedNode);
            if (pinnedNode) {
                if (networkRef.current) {
                    networkRef.current.focus(nodeId, { scale: 1.5, offset: { x: 0, y: 0 } });
                }
            } else {
                alert('釘選的節點未找到');
            }
        } else {
            alert('沒有釘選的節點');
        }
    };

    const handleClickOpen = (nodeId) => {
        setNodeContent(null);
        setOpen(true);
        fetchNodeData(nodeId);

        if (networkRef.current) {
            networkRef.current.focus(nodeId, { scale: 1.5, offset: { x: 0, y: 0 } });
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchNodeData = async (nodeId) => {
        try {
            const response = await axios.get(`${url.backendHost + config[11].getOneNode}/${nodeId}`);
            setNodeContent({ 
                ...response.data, 
                renderedContent: { __html: response.data.content } // 格式化後的 HTML 內容
            });
            // console.log('節點內容: ', response.data);
        } catch (err) {
            console.error(err);
        }
    };

    // 獲取 groupId，並在其後渲染 getNodes()
    const fetchGroupData = async () => {
        const enterDifferentGroupEndpoint = `${url.backendHost}${config[16].EnterDifferentGroup}${sessionStorage.getItem(
            "joinCode"
        )}/${sessionStorage.getItem("userId")}`;
        const getMyGroupEndpoint = `${url.backendHost}${config[12].getMyGroup}/${sessionStorage.getItem(
            "activityId"
        )}/${sessionStorage.getItem("userId")}`;

        try {
            const response = await axios.get(enterDifferentGroupEndpoint);
            const fetchedGroupId = response.data.data[0].id;
            localStorage.setItem("groupId", fetchedGroupId);
            sessionStorage.setItem("groupId", fetchedGroupId);
            setGroupId(fetchedGroupId); // 更新 groupId 狀態
        } catch (error) {
            try {
                const response = await axios.get(getMyGroupEndpoint);
                const fetchedGroupId = response.data.data[0].id;
                localStorage.setItem("groupId", fetchedGroupId);
                sessionStorage.setItem("groupId", fetchedGroupId);
                setGroupId(fetchedGroupId); // 更新 groupId 狀態
            } catch (error) {
                console.error("獲取群組資料時出錯", error);
            }
        } finally {
            await getNodes();
        }
    };

    useEffect(() => {
        async function fetchData() {
            await fetchGroupData();
            setSocket(io.connect(url.socketioHost,{path: '/s/socket.io'}));
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (ws) {
            console.log("初始化 WebSocket");
            ws.on("connect", () => {
                console.log("WebSocket 已連接");
            });

            ws.on(`node-recieve-${activityId}`, (body) => {
                if (body.groupId == sessionStorage.getItem('groupId')) {
                    const newNode = {
                        createdAt: body.createdAt || new Date().toISOString(),
                        ...genNode(body),
                    };
                    
                    const updatedAllNodes = [...allNodes, newNode];
                    setAllNodes(updatedAllNodes);

                    const filteredNodes = filterNodes(updatedAllNodes, timeFilter, groupFilter);
                    setGraph((graph) => ({
                        nodes: filteredNodes,
                        edges: graph.edges,
                    }));
                    // 如果是公告，更新公告區
                    if (newNode.isAnnouncement) {
                        setAnnouncements((prevAnnouncements) => [
                            newNode, // 公告區使用相同處理過的節點
                            ...prevAnnouncements,
                        ]);
                    }
                }
            });
            ws.on(`edge-recieve-${activityId}`, (body) => {
                if (body.groupId == sessionStorage.getItem("groupId")) {
                    setGraph((graph) => ({
                        nodes: graph.nodes,
                        edges: [...graph.edges, genEdge(body)],
                    }));
                }
            });
            return () => {
                ws.off(`node-recieve-${activityId}`);
                ws.off("connect");
            };
        }
    }, [ws, timeFilter, groupFilter, allNodes, activityId, groupId]);

    const getNodes = async () => {
        if (sessionStorage.getItem("groupId") == null) {
            await fetchGroupData();
        }

        try {
            const fetchData = await axios.get(`${url.backendHost + config[8].getNode}/${sessionStorage.getItem('groupId')}`);

            const fetchEdge = await axios.get(`${url.backendHost + config[10].getEdge}/${sessionStorage.getItem('groupId')}`);

            console.log("fetchData: ", fetchData);
            // console.log("fetchEdge: ", fetchEdge);

            const nodeData = fetchData.data[0].Nodes.map((node) => {
                const createdAt = node.createdAt ? new Date(node.createdAt) : null;
                const formattedCreatedAt = createdAt ? createdAt.toISOString() : 'Invalid Date';

                const generatedNode = {
                    ...genNode(node),
                    createdAt: formattedCreatedAt,
                };

                console.log(`生成節點:`, generatedNode);
                return generatedNode;
            });

            const edgeData = fetchEdge.data.map((edge) => genEdge(edge));

            console.log("nodeData: ", nodeData);
            console.log("edgeData: ", edgeData);

            setAllNodes(nodeData);

            setGraph({
                nodes: filterNodes(nodeData, timeFilter, groupFilter),
                edges: edgeData,
            });
        } catch (error) {
            console.error('獲取節點或邊時出錯:', error);
        }
    };

    const filterNodes = (nodes, timeFilter, groupFilter, keywordFilter = '') => {
        const now = new Date();
    
        const filteredNodes = nodes.map((node) => {
            // 時間篩選
            let passesTimeFilter = true;
            if (node.createdAt && !isNaN(Date.parse(node.createdAt))) {
                const nodeDate = new Date(node.createdAt);
                if (timeFilter > 0) {
                    passesTimeFilter = now - nodeDate <= timeFilter * 60 * 1000;
                }
            }
    
            // 類型篩選
            const matchesGroupFilter = groupFilter === 'all' || node.group === groupFilter;
    
            // 關鍵字篩選（檢查 label 和 title 是否包含關鍵字）
            const matchesKeywordFilter =
                !keywordFilter || // 如果關鍵字為空，視為通過篩選
                (node.title && node.title.includes(keywordFilter)) || // title 包含關鍵字
                (node.label && node.label.includes(keywordFilter));   // label 包含關鍵字
    
            // 決定是否淡化節點
            const isFaded = !(passesTimeFilter && matchesGroupFilter && matchesKeywordFilter);
            const isPinned = String(node.id) === String(pinnedNodeId);
    
            // 確保 node.color 存在
            const nodeColor = node.color || { border: '#CCCCCC', background: '#EEEEEE' };
    
            return {
                ...node,
                color: isFaded
                    ? { ...nodeColor, border: '#CCCCCC', background: '#F0F0F0' } // 灰色邊框和淡灰背景
                    : nodeColor, // 保持原有顏色
            };
        });
    
        console.log('篩選後的節點:', filteredNodes); // 調試打印
        return filteredNodes;
    };
    
    

    const handleTimeFilterChange = (event) => {
        const value = event.target.value;
        const selectedFilter = Number(value);
        setTimeFilter(selectedFilter);
    
        const filteredNodes = filterNodes(allNodes, selectedFilter, groupFilter, keywordFilter);
        console.log('時間篩選條件:', selectedFilter);
        console.log('篩選後的節點:', filteredNodes);
    
        setGraph({
            nodes: filteredNodes,
            edges: graph.edges,
        });
        setGraphKey(prevKey => prevKey + 1); // 更新 graphKey，強制刷新圖表
    };
    

    const handleGroupFilterChange = (event) => {
        const selectedGroup = event.target.value;
        setGroupFilter(selectedGroup);
    
        const filteredNodes = filterNodes(allNodes, timeFilter, selectedGroup, keywordFilter);
        console.log('類型篩選條件:', selectedGroup);
        console.log('篩選後的節點:', filteredNodes);
    
        setGraph({
            nodes: filteredNodes,
            edges: graph.edges,
        });
        setGraphKey(prevKey => prevKey + 1); // 更新 graphKey，強制刷新圖表
    };
    

    const options = {
        layout: {
            randomSeed: 23,
            improvedLayout: true,
            hierarchical: {
                enabled: true,
                blockShifting: true,
                edgeMinimization: true,
                nodeSpacing: 150,
                direction: "RL",
                sortMethod: "hubsize",
            },
        },
        interaction: {
            navigationButtons: showNavbar ? true : false,
            dragNodes: true,
            dragView: true,
            hideEdgesOnDrag: false,
            hideEdgesOnZoom: false,
            hideNodesOnDrag: false,
            hover: false,
            hoverConnectedEdges: true,
            keyboard: {
                enabled: false,
                speed: { x: 10, y: 10, zoom: 0.02 },
                bindToWindow: true,
            },
            multiselect: false,
            selectable: true,
            selectConnectedEdges: true,
            tooltipDelay: 300,
            zoomSpeed: 1,
            zoomView: true,
        },
        clickToUse: false,
        groups: {
            idea: {
                color: {
                    border: "#FFC",
                    background: "#FFC",
                    fontSize: 5,
                    highlight: {
                        border: "#FFC",
                        background: "#FFC",
                    },
                },
            },
            question: {
                color: {
                    border: "#CCF",
                    background: "#CCF",
                    highlight: {
                        border: "#CCF",
                        background: "#CCF",
                    },
                },
            },
            information: {
                color: {
                    border: "#CFC",
                    background: "#CFC",
                    highlight: {
                        border: "#CFC",
                        background: "#CFC",
                    },
                },
            },
            experiment: {
                color: {
                    border: "#FFDBDB",
                    background: "#FFDBDB",
                    highlight: {
                        border: "#FFDBDB",
                        background: "#FFDBDB",
                    },
                },
            },
            record: {
                color: {
                    border: "#B9DCF4",
                    background: "#B9DCF4",
                    highlight: {
                        border: "#B9DCF4",
                        background: "#B9DCF4",
                    },
                },
            },
            reply: {
                color: {
                    border: "#FFF",
                    background: "#FFF",
                    highlight: {
                        border: "#FFF",
                        background: "#FFF",
                    },
                },
            },
            // 可以在此添加更多群組
        },
        edges: {
            color: "#8B8B8B",
            width: 1,
            length: 600,
            arrows: {
                from: {
                    enabled: true,
                    scaleFactor: 0.7,
                },
                to: {
                    enabled: false,
                },
            },
        },
        nodes: {
            shape: "box",
            borderWidth: 1,
            shapeProperties: {
                borderRadius: 1,
            },
            opacity: 1, // 默認透明度
            fixed: {
                x: true,
                y: true,
            },
            font: {
                color: "#343434",
                size: 2, // px
                face: "arial",
                background: "none",
                strokeWidth: 0, // px
                strokeColor: "#ffffff",
                align: "left",
                multi: false,
                vadjust: 0,
                bold: {
                    color: "#343434",
                    size: 2, // px
                    face: "arial",
                    vadjust: 0,
                    mod: "bold",
                },
                ital: {
                    color: "#343434",
                    size: 5, // px
                    face: "arial",
                    vadjust: 0,
                    mod: "italic",
                },
                boldital: {
                    color: "#343434",
                    size: 5, // px
                    face: "arial",
                    vadjust: 0,
                    mod: "bold italic",
                },
                mono: {
                    color: "#343434",
                    size: 5, // px
                    face: "courier new",
                    vadjust: 2,
                    mod: "",
                },
            },
            hidden: false,
            label: "HTML",
            level: undefined,
            margin: 10,
            shadow: {
                color: "rgba(33,33,33,.7)",
                size: 10,
                x: 10,
                y: 10,
            },
            heightConstraint: { minimum: 100, valign: "middle" },
            widthConstraint: { minimum: 100, maximum: 100 },
            mass: 1,
            physics: false,
            scaling: {
                label: {
                    enabled: true,
                    min: 16,
                    max: 16,
                    drawThreshold: 12,
                    // maxVisible: 30,
                },
                customScalingFunction: function (min, max, total, value) {
                    if (max === min) {
                        return 0.5;
                    } else {
                        let scale = 1 / (max - min);
                        return Math.max(0, (value - min) * scale);
                    }
                },
            },
            value: 1,
        },
    };

    const events = {
        click: (event) => {
            console.log(`Graph:click:events:`, event);
            console.log(`Graph:click:graph`, graph);
            if (event.nodes.length === 1) {
                handleClickOpen(event.nodes[0]);
                sessionStorage.setItem('nodeId', event.nodes[0]);
            }
        },
        click_chatroom: (nodeid) => {
            console.log(`Graph:click:nodeid:`, nodeid);
            handleClickOpen(nodeid);
            sessionStorage.setItem('nodeId', nodeid);
        },
    };

    // 聊天室介面
    const Chat = ({ data }) => {
        // 將 nodes 轉換為字典，以便於查詢
        const nodesMap = data.nodes.reduce((acc, node) => {
            acc[node.id] = node;
            return acc;
        }, {});
        const uniqueEdges = data.edges.filter((edge, index, self) =>
            index === self.findIndex((e) => e.from === edge.from && e.to === edge.to)
          );

        return (
          <div style={{ margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', overflowY: 'auto', height: '85%' }}>
            {data.nodes.map(node => (
              
              <div 
                key={node.id} 
                nodeId={node.id} 
                style={{ margin: '10px 0', padding: '10px', borderRadius: '5px', backgroundColor: node.color.background, border: `1px solid ${node.color.border}` }}
                onClick={() => events.click_chatroom(node.id)}
                >
                {/* 檢查該訊息是根回覆 */}
                {uniqueEdges
                    .filter(edge => edge.from === node.id) // 找到回覆此訊息的邊
                    .map(edge => {
                    const replyNode = nodesMap[edge.to]; // 根據邊的 to 屬性獲取回覆的節點
                    return (
                        <div key={replyNode.id} style={{ marginTop: '10px', padding: '8px', borderRadius: '5px', backgroundColor: 'lightgray', color: 'gray', border: `1px solid ${replyNode.color.border}` }}>
                        <div><strong>{replyNode.label}</strong></div>
                        <div dangerouslySetInnerHTML={{ __html: replyNode.title }} />
                        <div style={{ fontSize: 'small', color: 'gray' }}>{new Date(replyNode.createdAt).toLocaleString()}</div>
                        </div>
                    );
                    })}

                {/* 節點內容 */}
                <div><strong>{node.label}</strong></div>
                <div dangerouslySetInnerHTML={{ __html: node.title }} />
                <div style={{ fontSize: 'small', color: 'gray' }}>{new Date(node.createdAt).toLocaleString()}</div>
              
                
              </div>
            ))}
          </div>
        );
      };

    // 添加調試信息
    useEffect(() => {
        console.log('Current groupId:', groupId);
        console.log('PinnedNodes:', pinnedNodes);
        console.log('Current pinnedNodeId:', pinnedNodeId);
    }, [groupId, pinnedNodes, pinnedNodeId]);
    

    return (
        <div className="home-container">
        <AnnouncementPopup
            groupId={groupId}
            networkRef={networkRef}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            open={open} 

        />
            {showNavbar && <ForumPage_Navbar ws={ws} />}
            {isFilterPopupVisible && (
                <div
                    id="filterPopup"
                    style={{
                        position: 'fixed',
                        top: '88px',
                        right: '118px',
                        width: '300px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        padding: '0px', 
                        zIndex: 100000,
                        textAlign: 'center', 
                    }}
                >
                    <h3 style={{ fontWeight: 'bold', margin: 0, padding: '15px 0' }}>篩選條件</h3>
                    <div style={{ margin: '15px 0' }}>
                        <label htmlFor="timeFilter" style={{ display: 'block', marginBottom: '10px' }}>時間範圍:</label>
                        <input
                            type="number"
                            id="timeFilter"
                            value={timeFilter}
                            onChange={handleTimeFilterChange}
                            style={{
                                width: '80%',
                                padding: '5px',
                                margin: '0 auto',
                                display: 'block',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                            }}
                            min="0"
                            placeholder="輸入分鐘"
                        />
                        <span style={{ display: 'block', marginTop: '5px' }}>分鐘內</span>
                    </div>
                    <div style={{ margin: '15px 0' }}>
                        <label htmlFor="groupFilter" style={{ display: 'block', marginBottom: '10px' }}>篩選類型:</label>
                        <select
                            id="groupFilter"
                            value={groupFilter}
                            onChange={handleGroupFilterChange}
                            style={{
                                width: '80%',
                                padding: '5px',
                                margin: '0 auto',
                                display: 'block',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                            }}
                        >
                            <option value="all">全部</option>
                            <option value="idea">想法💡</option>
                            <option value="question">問題❓</option>
                            <option value="record">記錄📄</option>
                            <option value="experiment">實驗🧪</option>
                            <option value="information">資訊🔍</option>
                            <option value="reply">回覆💬</option>
                        </select>
                    </div>
                    <div style={{ margin: '15px 0' }}>
                        <label htmlFor="keywordFilter" style={{ display: 'block', marginBottom: '10px' }}>關鍵字:</label>
                        <input
                            type="text"
                            id="keywordFilter"
                            value={keywordFilter}
                            onChange={handleKeywordFilterChange}
                            style={{
                                width: '80%',
                                padding: '5px',
                                margin: '0 auto',
                                display: 'block',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                            }}
                            placeholder="輸入標題或內容關鍵字"
                        />
                    </div>

                </div>
            )}

            <div
                id="filterButton"
                style={{
                    position: 'fixed',
                    top: '18px',
                    right: '50px',
                    zIndex: 10000,
                }}
            >
                <Button
                    variant="contained"
                    onClick={toggleFilterPopup}
                    disabled={open}
                    style={{
                        backgroundColor:open ? '#d3d3d3' : '#fa9f1e', 
                        color:  open ? '#7d7d7d' : 'white',
                        fontWeight: 'bold',
                        width: '40px',
                        height: '62px',
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        padding: '0px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', 
                        right: '50px',
                    }}
                >
                    篩
                </Button>
            </div>


            
            {
                isMapBoard && 
                <div
                    id="graph"
                    style={{
                        flex: 1,
                        height: "100vh",
                        overflow: "auto",
                        position: showNavbar ? "fixed" : "relative",
                        top: "0",
                        left: "0",
                        marginLeft: "64px",
                    }}>
                    <Graph
                        key={graphKey} 
                        graph={graph}
                        options={options}
                        events={events}
                        getNetwork={(network) => {
                            networkRef.current = network;
                        }}
                    />
                </div>
            }
                
            
            {
                !isMapBoard && <div
                id="graph"
                style={{
                    flex: "1 1 0%",
                    height: "100vh",
                    overflow: "auto",
                    position: "fixed",
                    top: "0px",
                    left: "0px",
                    "margin-left": "64px",
                    "margin-top": "64px",
                    right: "0px"
                }}><Chat data={graph} />
                </div>
            }
                
            
            
            {
                activityInfo && activityInfo.settings.intro &&(
                    <div
                style={{
                    margin: '0 auto',
                    marginBottom: '100px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                }}
                >
                    <p style={{ marginBottom: '5px',padding: '20px 20px' }}>活動資訊和說明</p>
                    <h2 style={{ marginBottom: '5px',padding: '20px 20px' }}>{activityInfo.settings.intro}</h2>

                </div>
                )
            }
            <ViewNode open={open} onClose={handleClose} nodeContent={nodeContent} ws={ws} groupId={groupId}/>
            {
                activityInfo && activityInfo.settings.helper_system &&(
                    <div style={{ height: '100vh' }}>
                        <CallComponent />
                    </div>
                )
            }
            {/* 顯示已釘選節點的標識 */}
            {pinnedNodeId && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: '#FFFFFF', 
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px', 
                    }}
                >
                    <Button
                        variant="text"
                        onClick={() => {
                            if (groupId) {
                                removePinnedNode(groupId); 
                                setPinnedNodeId(null);
                                alert('已取消釘選');
                                window.dispatchEvent(new Event('pinnedNodeUpdated'));
                            }
                        }}
                        style={{
                            color: '#d66f87', 
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0', 
                            minWidth: 'auto',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        取消釘選
                    </Button>
                    <Button
                        variant="text"
                        onClick={handleViewPinned}
                        style={{
                            color: '#4187cc', // MUI primary blue color
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0', // 去除默認 padding
                            minWidth: 'auto', // 去除默認 min-width
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        回到釘選
                    </Button>
                </div>
            )}
        </div>
    );
}
