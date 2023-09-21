import React from "react";
import Link from "next/link";
// reactstrap components
import {
  UncontrolledCollapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";

function AdminNavbar({
  showLog= true,
  showReg= true
}) {
  return (
    <>
      <Navbar className="navbar-top navbar-horizontal navbar-dark" expand="md">
        <Container className="px-4">
          <Nav className="ml-auto" navbar>
            { showReg ? (
              <NavItem>
                <Link href="/auth/new-user">
                  <NavLink href="#r" className="nav-link-icon">
                    <i className="ni ni-circle-08" />
                    <span className="nav-link-inner--text">Registrar</span>
                  </NavLink>
                </Link>
              </NavItem>
            ) : null }
            { showLog ? (
              <NavItem>
                <Link href="/auth/signin">
                  <NavLink href="#l" className="nav-link-icon">
                    <i className="ni ni-key-25" />
                    <span className="nav-link-inner--text">Inicia Sesion</span>
                  </NavLink>
                </Link>
              </NavItem>
            ) : null }
            </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;
