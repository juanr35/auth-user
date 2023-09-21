import React from "react";
import { useState, useEffect } from "react";
import { getProviders, signIn, signOut, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router';
import axios from "axios"

// reactstrap components
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  FormFeedback,
  Input,
  InputGroup,
  Row,
  Col,
  Modal,
  Alert,
} from "reactstrap";

import PageLoading from "./PageLoading"

const stepsMessages= [
  { 
    title: 'Ingresa tu email', 
    name: 'email',
    placeholder: 'example@mail.com',
    error: 'Enter the email' 
  },
  { 
    title: 'Hemos enviado un codigo secreto a tu email', 
    name: 'code',
    placeholder: 'code', 
    error: 'Enter the code' 
  },
  { 
    title: 'Ingresa la nueva contraseña', 
    name:'password',
    placeholder: 'password',
    error: 'Enter the password' 
  },
  { 
    title: 'Completado', 
    name:'password',
    placeholder: 'success',
    error: 'Enter the password' 
  }
]

function ForgotPassword(props) {
  const { data: session, status } = useSession()
  const { query, push } = useRouter();
  
  useEffect(() => {    
    if ( session && !session?.user.verified ) {
      signOut({redirect: false})
    }
    else if ( session && session?.user.verified ) {
      push(`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/profile`)
    }
  }, [session])
   
  const [fields, setFields] = useState({
    email: '',
    code: '',
    password: '',
  })
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState()
  const [stateForm, setStateForm] = useState({
    loading: false,
    error: false
  });

  const handleChange = (e) => {
    setFields({
      ...fields,
      [e.target.name]: e.target.value
    })
  };
  
  const validate = (name) => {
    let error = {};

    if (!fields || !fields[name]) {
      error.field = stepsMessages[step].error;
    }

    setMessage({error})
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errs = validate(stepsMessages[step].name);
         
    if (Object.keys(errs).length) return;
    
    setStateForm({
      ...stateForm,
      loading: true
    })

    try {
      let res
      switch (step) {
        case 0:
          res = await axios({
            url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/forgot-password/${fields.email}`,
            method: "get",
          })              
          break;
        case 1:
          res = await axios({
            url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/forgot-password/${fields.email}`,
            method: "post",
            data: { code: fields.code }
          })
          break;
        case 2:
          res = await axios({
            url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/forgot-password/${fields.email}`,
            method: "post",
            data: { 
              code: fields.code,
              password: fields.password
            }
          })
          break;
        default:
          throw "Step invalid"
      }

      if (res.status == 201) {
        if ( step === 2 ) {
          push(`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/signin`)
        }
        setMessage({ success: res?.data?.msg })
        setStep((step) => step + 1)
      }

    } 
    catch (err) {
      if (err?.response?.status == 401) {
        let error = { msg: err.response?.data?.msg } 
        setMessage({error})
      }
      else {
        let error = { msg: "Check the connection" } 
        setMessage({error})
      }
    }
    finally {
      setStateForm({loading: false})            
    }
  };

  return (
    <>
      <Modal
        className="text-center" 
        isOpen={stateForm.loading}
        centered={true}
        fade={false}
      >
        <PageLoading heightCard={4}/>
      </Modal>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 pt-lg-5">
            <div className="text-center text-muted mb-4">
              <h3>{stepsMessages[step].title}</h3>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <Input
                    placeholder={stepsMessages[step].placeholder}
                    type={stepsMessages[step].name != 'password' ? 'text' : 'password'}
                    name={stepsMessages[step].name}
                    value={fields && fields[stepsMessages[step]?.name]}
                    onChange={handleChange}
                    invalid={message?.error?.field?.length > 0}
                    style={{fontSize: '30px', textAlign: 'center'}}
                  />
                  <FormFeedback>
                    {message?.error?.field}
                  </FormFeedback>
                </InputGroup>
              </FormGroup>
              { message?.error?.msg ? (
                <Alert color="danger" >
                  {message.error.msg}
                </Alert>
              ) : null }
              { message?.success ? (
                <Alert color="success" >
                  {message.success}
                </Alert>
              ) : null }
              <div className="text-center">
                <Button 
                  className="mt-1" 
                  color="primary" 
                  type="submit"
                >
                  Send
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
}

export default ForgotPassword;
