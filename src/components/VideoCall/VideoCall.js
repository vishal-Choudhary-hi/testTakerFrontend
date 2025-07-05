import React, { useEffect, useState, useRef } from "react";
import apiCall from "../../services/api";
import ShowVideoCallIframe from "./ShowVideoCallIframe";

const VideoCall = ({ fromUserId, toUserId, showModal, toUserName, onModalClose, testId, socket }) => {
    const [videoCallLink, setVideoCallLink] = useState(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        const generateVideoCallLink = async () => {
            const response = await apiCall("get", `dashboard/creater/generateVideoCallLink?toUserId=${toUserId}`, null, null, true);
            if (response?.data?.link) {
                setVideoCallLink(response.data.link);
            }
        };

        generateVideoCallLink();
    }, []);

    useEffect(() => {
        if (!videoCallLink || !socket) return;

        socket.send(JSON.stringify({
            type: "video_call",
            from: fromUserId,
            to: toUserId,
            testId: testId,
            link: videoCallLink,
        }));
    }, [videoCallLink, socket, fromUserId, toUserId, testId]);

    if (!videoCallLink) return null;

    return (
        <ShowVideoCallIframe link={videoCallLink} />
    );
};

export default VideoCall;
