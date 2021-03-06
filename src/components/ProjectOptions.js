import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Button, Modal, Header, Icon } from 'semantic-ui-react';
import { completeProject, archiveProject, deleteFromArchive } from '../api';
import { ADD_TO_ARCHIVE, REMOVE_FROM_ARCHIVE, REMOVE_PROJECT, UPDATE_USER, ADD_ARCH_DOC } from '../store/type';

const ProjectOptions = props => {

  const dispatch = useDispatch()
  const { id, name, start_date, due_date } = props.project
  const keyHolder = useSelector(state => state.app.keyHolder) 
  const [ open, setOpen ] = useState(false)

  // add project to the complete project list
  const handleComplete = () => {
    completeProject(id)
    .then(data => {
        const { users, project, documents } = data
        dispatch({ type: REMOVE_PROJECT, payload: project })
        // update each user in the redux store
        for (let user of users) {
          dispatch({ type: UPDATE_USER, payload: user })
        }
        return { project, documents };
    })
    .then(async archProject => {
      return archiveProject(archProject)
        .then(data => {
          const { archived_project } = data
          dispatch({ type: ADD_TO_ARCHIVE, payload: archived_project})
          for (let doc of archived_project.archive_documents) {
            dispatch({ type: ADD_ARCH_DOC, payload: doc })
          }
        })
    });
  }

  const handleDelete = () => {
    deleteFromArchive(id)
    .then(data => {
      const { archiveId } = data
      // update projects from the redux store
      dispatch({ type: REMOVE_FROM_ARCHIVE, payload: archiveId })
      setOpen(false)
    })
  }

  return (
    <List.Item className={props.listClass}>
      <List.Icon name={props.icon} size='large' verticalAlign='middle' className="ProjectList-Icon-Color"/>
      <List.Content>
        { keyHolder.admin ?
          <List.Content floated='right'>
               <Modal
                closeIcon
                size="tiny"
                open={open}
                trigger={<Button className={`${props.btnClass}`}>{props.btnName}</Button>}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
              >
                <Header icon={props.active ? "calendar check" : "trash"} content='Confirm' />
                <Modal.Content>
                  {
                    props.active ?
                    <p>
                      You're about to close all activities for this project. Collaborators will no longer be able to share new documents.
                    </p>
                    :
                    <p>
                      Are you sure you want to delete this project? You will no longer have access to this project's details. 
                    </p>
                  }
                </Modal.Content>
                <Modal.Actions>
                  <Button color='red' onClick={() => setOpen(false)}>
                    <Icon name='remove' /> No
                  </Button>
                  <Button color='green' onClick={props.active ? handleComplete : handleDelete}>
                    <Icon name='checkmark' /> Yes
                  </Button>
                </Modal.Actions>
              </Modal>
          </List.Content>
          : null
        } 
        <List.Content floated='right'>
          <Button as={Link} to={`${props.linkToDetails}${id}`} className="ProjectList-Button-Color">Details</Button>
        </List.Content>
          <List.Header as={Link} to={`${props.linkToDetails}${id}`} className="ProjectList-Project-Name">{name}</List.Header>
        <List.Description as='a'className="ProjectList-Project-Date">Start date: {start_date} | Due date: {due_date}</List.Description>
      </List.Content>
    </List.Item>
  )
}

export default ProjectOptions;