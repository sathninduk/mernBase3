import React, {Component} from "react";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";

import {setCurrentUser, logoutUser} from "./actions/authActions";
import {Provider} from "react-redux";
import store from "./store";

import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import AcceptVerification from "./components/layout/VerificationAccept";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Verification from "./components/user/verification";
import Forgot from "./components/auth/Forgot";
import ForgotSuccess from "./components/auth/forgotSuccess";
import ForgotChange from "./components/auth/ForgotChange";
import Admin from "./components/admin/Dashboard";
import Instructor from "./components/instructor/Dashboard";
import PrivateRoute from "./components/private-route/PrivateRoute";
import Dashboard from "./components/user/Dashboard";
import AdminUsers from "./components/admin/users";
import AdminUsersEdit from "./components/admin/edit-user";

import AdminInstructors from "./components/admin/instructors";
import AdminNewInstructor from "./components/admin/new-instructor";
import AdminSuperAdmins from "./components/admin/superadmins";
import AdminNewSuperAdmin from "./components/admin/new-superadmin";

import AdminPasswordChange from "./components/admin/edit-password";
import InstructorPasswordChange from "./components/instructor/edit-password";
import UserPasswordChange from "./components/user/edit-password";

import "./App.css";

// Check for token to keep user logged in
if (localStorage.jwtToken) {
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
    // Check for expired token
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());

        // Redirect to login
        window.location.href = "./login";
    }
}

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <Navbar/>
                        <Route exact path="/" component={Landing}/>
                        <Route exact path="/verify-email/:id" component={AcceptVerification}/>
                        <Route exact path="/register" component={Register}/>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/forgot" component={Forgot}/>
                        <Route exact path="/forgot-success" component={ForgotSuccess}/>
                        <Route exact path="/forgot-change-password" component={ForgotChange}/>
                        <Switch>
                            <PrivateRoute exact path="/dashboard" component={Dashboard}/>
                            <PrivateRoute exact path="/instructor" component={Instructor}/>
                            <PrivateRoute exact path="/verification" component={Verification}/>
                            <PrivateRoute exact path="/admin" component={Admin}/>
                            <PrivateRoute exact path="/admin/users" component={AdminUsers}/>
                            <PrivateRoute exact path="/admin/users/edit/:id" component={AdminUsersEdit}/>
                            <PrivateRoute exact path="/admin/instructors" component={AdminInstructors}/>
                            <PrivateRoute exact path="/admin/instructors/new" component={AdminNewInstructor}/>
                            <PrivateRoute exact path="/admin/super-admins" component={AdminSuperAdmins}/>
                            <PrivateRoute exact path="/admin/super-admins/new" component={AdminNewSuperAdmin}/>
                            <PrivateRoute exact path="/admin/settings/password/" component={AdminPasswordChange}/>
                            <PrivateRoute exact path="/instructor/settings/password/"
                                          component={InstructorPasswordChange}/>
                            <PrivateRoute exact path="/user/settings/password/" component={UserPasswordChange}/>
                        </Switch>
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;
