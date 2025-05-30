import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    Button,
} from '@mui/material';
import { inviteParticipant } from '../../api/StudyAPI';
import { getParticipantsApi } from '../../api/ParticipantAPI';
import { toast_error, toast_success } from '../../utils';
export default function InviteModal({ open, onClose, studyId, onInvited }) {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        if (open) {
            getParticipantsApi().then((res) => {
                if (Array.isArray(res.data)) {
                    setParticipants(res.data);
                } else if (res.data && Array.isArray(res.data.participants)) {
                    setParticipants(res.data.participants);
                } else {
                    setParticipants([]); // fallback to prevent crash
                    console.error('Unexpected participant response:', res.data);
                }
            }).catch((err) => {
                console.error('Failed to fetch participants:', err);
                setParticipants([]);
            });
        }
    }, [open]);

    const handleInvite = async (participantId) => {
        const res = await inviteParticipant({study_id: studyId, participant_id: participantId});
        if(res?.status === "success") {
            toast_success(res?.message || 'Success to invite participant');
        }
        else if(res?.status === "duplicate") {
            toast_success(res?.message);
        }
        else if(res?.status === "duplicate") {
            toast_success(res?.message);
        }
        else {
            toast_error(res?.message);
        }
        onInvited(); // refresh list in StudyManagement
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Invite Participants</DialogTitle>
            <DialogContent>
                <List>
                    {participants.map((p) => (
                        <ListItem key={p.id} secondaryAction={
                            <Button onClick={() => handleInvite(p.id)} variant="outlined">Invite</Button>
                        }>
                            <ListItemText primary={p.userID} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}
