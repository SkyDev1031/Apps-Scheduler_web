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
import { faTrash, faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function StudyCard({ study, onInviteClick, onRemoveParticipant }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6">{study.title}</Typography>
        <List>
          {study.participants.map((p) => (
            <ListItem
              key={p.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => onRemoveParticipant(study.id, p.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              }
            >
              <ListItemText primary={p.userID} secondary={`Status: ${p.status}`} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          onClick={() => onInviteClick(study.id)}
        >
          Invite Participants
        </Button>
      </CardContent>
    </Card>
  );
}
