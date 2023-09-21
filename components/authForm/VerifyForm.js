import React from "react";
import { useState, useEffect } from "react";
import { getProviders, signIn, signOut, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router';

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

function Verify(props) {
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
   
 useEffect(() => {    
   setField({
     ...fields,
     _id: query.id
    })
  }, [])
  
  const [fields, setField] = useState({ 
    code: "",
    _id: "",
  })
  const [errors, setErrors] = useState()
  const [stateForm, setStateForm] = useState({
    loading: false,
    error: false
  });

  const handleChange = (e) => {
    setField({
      ...fields,
      [e.target.name]: e.target.value
    })
  };
  
  const validate = () => {
    let errors = {};

    if (!fields?.code) {
      errors.code = "Enter code";
    }

    setErrors(errors)
    return errors;
  };

  /**
  * In case fail auth
  * @param {String} method 'Credentials' or 'Oauth' method
  * @param {String} error Error received
  * need develop this function
  */
  function handleAuthFail (method, resError) {
    console.log(resError)
    if (resError == "CredentialsSignin") { 
      setErrors({msg: "Something has gone wrong. The code may have expired or be invalid. Check your email"})
    }
    else {
      setErrors({msg: "Check the connection"})        
    }
    setStateForm({error: true})      
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errs = validate();
         
    if (Object.keys(errs).length) return;
     
    setStateForm({
      ...stateForm,
      loading: true
    })
    
    let res = await signIn("verify", { ...fields, redirect: false })
    
    if (res.error) {
      console.log(res)
      handleAuthFail("Credentials", res.error)
    }
    else {
      setErrors({})
    }
    
    return
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
              <h3>Ingresa el codigo secreto que hemos enviado a tu email</h3>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <Input
                    placeholder="Ingresa el codigo"
                    type="text"
                    name="code"
                    value={fields?.code}
                    onChange={handleChange}
                    invalid={errors?.code?.length > 0}
                    style={{fontSize: '30px', textAlign: 'center'}}
                  />
                  <FormFeedback>
                    {errors?.code}
                  </FormFeedback>
                </InputGroup>
              </FormGroup>
              { errors?.msg ? (
                <Alert color="danger" >
                  {errors?.msg}
                </Alert>
              ) : null }
              <div className="text-center">
                <Button 
                  className="mt-1" 
                  color="primary" 
                  type="submit"
                >
                  Enviar
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
}

export default Verify;
