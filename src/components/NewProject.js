import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { DatesRangeInput } from 'semantic-ui-calendar-react';
import { Container, Form, Button, Header, Icon, Divider } from 'semantic-ui-react';
import useFormFields from '../hooks/useFormFields';
import AddUsersTable from './AddUsersTable';
import "../resources/NewProject.css";
import { createProject } from '../api';
import { SET_USERS, ADD_NEW_PROJECT, REMOVE_USER_FROM_TEMP_PROJECT } from '../store/type';

const NewProject = (props) => {
  const [fields, handleFieldChange] = useFormFields({
    title: "",
    description: ""
  })
  
  const [dateRange, setDateRange] = useState("")
  const users = useSelector(state => state.user.users)
  const addUsersId = useSelector(state => state.project.addUsersId)
  const dispatch = useDispatch()

  const handleDateRangeChange = (name, value) => {
    setDateRange(value)
  }

  // update users available state =======> FUTURE HELPER <======= 
  const updateUsers = userProjects => {
    for (let user of userProjects) {
      const filteredUsers = users.map(userMap => { 
        if (userMap.id === user.id) {
          return user
        } else {
          return userMap
        }
      })
      // set users state with the updatedUsers
      dispatch({ type: SET_USERS, payload: filteredUsers })
    }
  }

  const handleSubmit = e => {
    e.preventDefault()

    const dateArray = dateRange.match(/.{1,12}/g)
    const startDate = dateArray[0].split(" ")[0]
    const dueDate = dateArray[1].split(" ")[1]

    const newProject = {
      name: fields.title,
      description: fields.description,
      startDate: startDate,
      dueDate: dueDate,
      assigned: [...addUsersId]
    }

    createProject(newProject)
    .then(data => {
      if (data.error) {
        // flash message logic goes here
        console.log(data.error)
      } else {
        // update users available state
        updateUsers(data.users)
        // add new project to redux store
        dispatch({ type: ADD_NEW_PROJECT, payload: data.project })
        // remove users from temporary s 
        dispatch({ type: REMOVE_USER_FROM_TEMP_PROJECT, payload: [] })
        props.history.push('/projects')
      }
    })
  }

  return (
    <Container id="NewProject-Container">
      <Form onSubmit={handleSubmit}>
        <Header as='h2' className="NewProject-Header-Align-Items">
          <span>
            <Icon name='puzzle' size="large" className="NewProject-Icon-Color"/>
            <Header.Content>
              <span className="NewProject-Title">Create Project</span>
            </Header.Content>
          </span>
        </Header>
        <Divider className="NewProject-Divider" />
        <Form.Group widths='equal'>
          <Form.Input fluid name="title" placeholder='Project Title' onChange={handleFieldChange}/>
        </Form.Group>
        <Form.TextArea name="description" placeholder='Project Description' onChange={handleFieldChange}/>
        <DatesRangeInput
          name="datesRange"
          placeholder="From - To"
          value={dateRange}
          iconPosition="left"
          onChange={(a, {name, value}) => handleDateRangeChange(name, value)}
        />
        <Form.Field widths='equal'>
          <AddUsersTable/>
        </Form.Field>
        <Button type="submit" className="NewProject-Submit-Button-Color">Create</Button>
      </Form>
    </Container>
  );
};

export default withRouter(NewProject);