import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faUserPlus,
  faUserMinus,
  faEye,
} from '@fortawesome/free-solid-svg-icons';

export default function StudyCard({ study, onInviteClick, onViewStudyClick, onDeleteStudyClick, onRemoveParticipant }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6">{study.title}</Typography>

        <List>
          {study.invitations.map((invitation) => {
            const participant = invitation.participant;

            return (
              <ListItem
                key={invitation.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => onRemoveParticipant(study.id, participant.id)}
                  >
                    <FontAwesomeIcon icon={faUserMinus} />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={participant?.userID || participant?.name || 'Unknown User'}
                  secondary={`Status: ${invitation.study_status}`}
                />
              </ListItem>
            );
          })}
        </List>

        <Button
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          onClick={() => onInviteClick(study.id)}
          className="action-button-study"
        >
          Invite Participants
        </Button>

        <Button
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faEye} />}
          onClick={() => onViewStudyClick(study.id)}
          className="action-button-study"
        >
          View Study Group
        </Button>

        <Button
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faTrash} />}
          onClick={() => onDeleteStudyClick(study.id)}
          className="action-button-study"
        >
          Delete Study Group
        </Button>
      </CardContent>
    </Card>
  );
}
