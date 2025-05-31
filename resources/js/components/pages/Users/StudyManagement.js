import { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
} from '@mui/material';

import MuiStudyGroupModal from './MuiStudyGroupModal';
import InviteModal from './InviteModal';
import StudyCard from './StudyCard';
import { useGlobalContext } from "../../contexts";
import {
  createStudy,
  getStudies,
  cancelInviteParticipant,
  deleteStudy
} from '../../api/StudyAPI';

import { toast_error, toast_success } from '../../utils';

export default function StudyManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const [studies, setStudies] = useState([]);
  const { setLoading, confirmDialog, user } = useGlobalContext();

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const res = await getStudies(user.id);
      const data = res.data;
      if (Array.isArray(data)) {
        setStudies(data);
      } else if (data && Array.isArray(data.studies)) {
        setStudies(data.studies);
      } else {
        setStudies([]);
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
      const response = await createStudy(formData);
      const newStudy = response.data?.study;
      if (newStudy) {
        setStudies(prev => [newStudy, ...prev]);
      } else {
        fetchStudies(); // fallback
      }
      toast_success('Study group created successfully!');
      setModalOpen(false);
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
      const res = await cancelInviteParticipant({
        study_id: studyId,
        participant_id: participantId,
      });
  
      setStudies(prev =>
        prev.map(study =>
          study.id === studyId
            ? {
                ...study,
                invitations: study.invitations?.filter(
                  inv => inv.participant?.id !== participantId
                ),
              }
            : study
        )
      );
  
      toast_success('Participant removed from this study group');
    } catch (err) {
      console.error(err);
      toast_error('Failed to remove participant');
    } finally {
      setLoading(false);
    }
  };
    
  const handleDeleteStudy = async (studyId) => {
    setLoading(true);
    try {
      await deleteStudy(studyId);
      setStudies(prev => prev.filter(study => study.id !== studyId));
      toast_success("Study Group deleted successfully");
    } catch (err) {
      toast_error("Something went wrong while deleting study group");
    } finally {
      setLoading(false);
    }
  };

  const handleStudyUpdated = (updatedStudy) => {
    setInviteModalOpen(false);
    if (updatedStudy) {
      setStudies(prev =>
        prev.map(study => (study.id === updatedStudy.id ? updatedStudy : study))
      );
    } else {
      fetchStudies(); // fallback if no data
    }
  };

  const handleViewStudy = (studyId) => {
    console.log('View study:', studyId);
    // You can implement routing or detail view here
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

      {studies.length === 0 ? (
        <Typography>No study groups found.</Typography>
      ) : (
        studies.map((study) => (
          <StudyCard
            key={study.id}
            study={study}
            onInviteClick={handleInviteClick}
            onRemoveParticipant={handleRemoveParticipant}
            onDeleteStudyClick={handleDeleteStudy}
            onViewStudyClick={handleViewStudy}
          />
        ))
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
        onInvited={handleStudyUpdated} // should pass updated study from modal
      />
    </Box>
  );
}
