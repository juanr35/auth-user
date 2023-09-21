import React from "react";
import { useState, useEffect } from "react";
import { getProviders, signIn, signOut, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router';
import axios from "axios"
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  FormFeedback,
  Form,
  Input,
  InputGroupText,
  InputGroup,
  Row,
  Col,
  Modal,
  Alert
} from "reactstrap";
// layout for this page
import GithubSvg from "../../assets/img/icons/common/github"
import GoogleSvg from "../../assets/img/icons/common/google"
import PageLoading from "./PageLoading"

export default function AuthForm({ 
    providers, 
    csrfToken,
    typeAuth = "signup",
  }) {

  const { data: session, status } = useSession()
  const { query, push } = useRouter();
   
  useEffect(() => {    
    if (status === "authenticated") {
      push(`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/profile`)
    }
  }, [status])

  useEffect(() => {    
    if (query.error) {
      handleAuthFail("oauth", query.error)
    }
  }, [])

  const [fields, setField] = useState()
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

    if (!fields?.name && typeAuth == "signup") {
      errors.name = "Name is required";
    }
    if (!fields?.email) {
      errors.email = "Email is required";
    }
    if (!fields?.password) {
      errors.password = "Password is required";
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
    if (method == "Credentials") {

      if (resError == "CredentialsSignin") {
        typeAuth == "signup" ? 
          setErrors({msg: "Email is invalid or already taken"})
          :
          setErrors({msg: "User not found or incorrect password"})
      }
      else {
        setErrors({msg: "Check the connection"})        
      }
    }
    else if (method == "oauth") {
        setErrors({msg: "Error. Oauth failed"})        
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
    
    let res
    
    if (typeAuth == "signin") {
      
      res = await signIn("credentials", { ...fields, redirect: false })
      
      if (res.error) {
        console.log(res)
        handleAuthFail("Credentials", res.error)
      }
      else {
        setErrors({})
      }
      return
    }
    
    else if (typeAuth == "signup") {
      try {        
        res = await axios({
          url: `${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/api/auth/users/signup`,
          method: "post",
          data: fields
        })

        if (res.status == 201) {
          push(`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/verify/${res.data._id}`)
        }

      } 
      catch (error) {
        if (error?.response?.status == 401) {
          setErrors({msg: "Email is invalid or already taken"})
        }
        else {
          setErrors({msg: "Check the connection"})
        }
        setStateForm({loading: false})      
        return
      }
    }
  };
  
  const handleOauthSubmit = (providerId) => (e) => {
    e.preventDefault()
    setStateForm({
      ...stateForm,
      loading: true
    })
    signIn(providerId)
  }
  
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
              <small>{typeAuth == "signup" ? "Registro" : "Iniciar sesion"}</small>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              { typeAuth == "signup" ? 
                (                  
                  <FormGroup>
                    <InputGroup className="input-group-alternative">
                      <InputGroupText>
                        <i className="ni ni-hat-3" />
                      </InputGroupText>
                      <Input 
                        placeholder="Nombre" 
                        type="text"
                        name="name"
                        value={fields?.name}
                        onChange={handleChange}
                        invalid={errors?.name?.length > 0}
                      />
                      <FormFeedback>
                        {errors?.name}
                      </FormFeedback>
                    </InputGroup>
                  </FormGroup>
                ) : null}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupText>
                    <i className="ni ni-email-83" />
                  </InputGroupText>
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={fields?.email}
                    onChange={handleChange}
                    invalid={errors?.email?.length > 0}
                  />
                  <FormFeedback>
                    {errors?.email}
                  </FormFeedback>
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                <Input
                    placeholder="Contraseña"
                    type="password"
                    name="password"
                    value={fields?.password}
                    onChange={handleChange}
                    invalid={errors?.password?.length > 0}
                  />
                  <FormFeedback>
                    {errors?.password}
                  </FormFeedback>
                </InputGroup>
              </FormGroup>
              { errors?.msg ? (
                <Alert color="danger" >
                  {errors?.msg}
                </Alert>
              ) : null }
              <Row className="my-4">
                <Col xs="12">
                  <div className="custom-control custom-control-alternative custom-checkbox">
                    <input
                      className="custom-control-input"
                      id="customCheck"
                      type="checkbox"
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheck"
                    >
                      { typeAuth == "signup" ? 
                        (
                          <span className="text-muted">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              Privacy Policy
                            </a>
                          </span>
                        ) : (
                          <span className="text-muted">Mantener sesion</span>
                        )
                      }
                    </label>
                  </div>
                </Col>
              </Row>
              <div className="text-center">
                <Button 
                  className="mt-1" 
                  color="primary" 
                  type="submit"
                >
                  { typeAuth == "signup" ? "Crear cuenta" : "Iniciar sesion"}
                </Button>
              </div>
            </Form>
          </CardBody>
          <CardHeader className="bg-transparent pb-5">
            <div className="text-muted text-center mt-1 mb-3">
              <small>O inicia sesion con</small>
            </div>
            <div className="text-center">
              <Row className="mt-2">
                <Col xs="6">
                  <Button
                    className="btn-neutral btn-icon mr-4"
                    color="default"
                    onClick={handleOauthSubmit("github")}
                  >
                    <span className="btn-inner--icon">
                      <GithubSvg/>
                    </span>
                    <span className="btn-inner--text">Github</span>
                  </Button>
                </Col>
                <Col xs="6">
                  <Button
                    className="btn-neutral btn-icon"
                    color="default"
                    onClick={handleOauthSubmit("google")}
                  >
                    <span className="btn-inner--icon">
                      <GoogleSvg/>
                    </span>
                    <span className="btn-inner--text">Google</span>
                  </Button>
                </Col>
              </Row>
            </div>
          </CardHeader>
        </Card>
        { typeAuth == "signup" ? 
          (
            <Row className="mt-3">
              <Col className="text-center" xs="12">
                <a
                  className="text-light"
                  href={`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/signin`}
                >
                  <small>¿Ya tienes una cuenta? Inicia Sesion</small>
                </a>
              </Col>
            </Row>
          ) : (
            <Row className="mt-3">
              <Col xs="6">
                <a
                  className="text-light"
                  href={`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/forgotPassword`}
                >
                  <small>¿Olvidaste tu contraseña?</small>
                </a>
              </Col>
              <Col className="text-right" xs="6">
                <a
                  className="text-light"
                  href={`${process.env.NEXT_PUBLIC_USER_AUTH_DOMAIN}/auth/new-user`}
                >
                  <small>Crear una cuenta</small>
                </a>  
              </Col>
            </Row>
          )
        }
      </Col>
    </>
  );
}