import { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

import MuiStudyGroupModal from './MuiStudyGroupModal';
import InviteModal from './InviteModal';
import StudyCard from './StudyCard';
import { useGlobalContext } from "../../contexts";
import {
  createStudy,
  getStudies,
  removeParticipant,
} from '../../api/StudyAPI';

import { toast_error, toast_success } from '../../utils';

export default function StudyManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const [studies, setStudies] = useState([]);
  const { setLoading, confirmDialog } = useGlobalContext();

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const res = await getStudies();
      const data = res.data
      console.log('Fetched studies:', data);
      if (Array.isArray(data)) {
        setStudies(data);
      } else if (data && Array.isArray(data.studies)) {
        setStudies(data.studies); // Adjust depending on your API response
      } else {
        setStudies([]); // fallback to empty array to prevent .map crash
        toast_error('Unexpected response from server');
      }
    } catch (err) {
      toast_error('Failed to fetch studies');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleCreateStudyGroup = async (formData) => {
    try {
      await createStudy(formData);
      toast_success('Study group created successfully!');
      setModalOpen(false);
      fetchStudies();
    } catch (error) {
      console.error('Failed to create study:', error);
      toast_error('Failed to create study group');
    }
  };

  const handleInviteClick = (studyId) => {
    setSelectedStudyId(studyId);
    setInviteModalOpen(true);
  };

  const handleRemoveParticipant = async (studyId, participantId) => {
    const isDelete = await confirmDialog();
    if (!isDelete) return;
    setLoading(true);
    try {
      const res = await removeParticipant({study_id: studyId, participant_id: participantId});
      // console.log(res)
      toast_success('Participant removed');
      fetchStudies();
      setLoading(false);
    } catch (err) {
      toast_error('Failed to remove participant');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Study Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => setModalOpen(true)}
        sx={{ mb: 3 }}
      >
        New Study Group
      </Button>

      {(
        studies.length === 0 ? (
          <Typography>No study groups found.</Typography>
        ) : (
          studies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              onInviteClick={handleInviteClick}
              onRemoveParticipant={handleRemoveParticipant}
            />
          ))
        )
      )}

      <MuiStudyGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateStudyGroup}
      />

      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        studyId={selectedStudyId}
        onInvited={fetchStudies}
      />
    </Box>
  );
}
