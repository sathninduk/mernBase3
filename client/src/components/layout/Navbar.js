import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";
import axios from "axios";
import {Redirect} from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

//axios.defaults.baseURL = process.env.APP_URL
const baseURL = require("../../config/keys").API_URL;

let pathname = window.location.pathname;
let split_path = pathname.split('/');
let path_length = split_path.length;

// id
let id = pathname.split('/').pop();

// id2
let id2 = pathname.split('/')[path_length - 2];

/*async function getCSRFToken() {
    const response = await axios.get('/api/u/security/csrf');
    axios.defaults.headers.post['X-CSRF-Token'] = response.data.CSRFToken;
}*/


class Navbar extends Component {

    /*useEffect = async () => {
        await getCSRFToken()
    }*/

    state = {
        verification: true,
        verification_2: false,
        logoutLoading: false
    }

    onLogoutClick = async e => {
        this.setState({logoutLoading: true});
        await axios.post(baseURL + `/api/u/token-logout`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'x-access-token',
                'x-access-token': localStorage.getItem("jwtToken")
            }
        }).then((res) => {
            console.log("Logout");
            this.setState({logoutLoading: false});
        }).catch((err) => {
            console.log(err);
            this.setState({logoutLoading: false});
        });

        e.preventDefault();
        this.props.logoutUser();

    };


    componentDidMount = () => {

        if (id === ''
            || id === 'login'
            || id === 'register'
            || id === 'forgot'
            || id === 'verification'
            || id === 'forgot-change-password'
            || id2 === 'verify-email') {

            if (id === 'verification') {


                axios.get(baseURL + `/api/u/security/check-point`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Headers': 'x-access-token',
                        'x-access-token': localStorage.getItem("jwtToken")
                    }
                }).then((res) => {
                    if (res.data.email) {
                        let verification = res.data.verification;
                        if (verification === 0) {
                            console.log("Unverified");
                            this.setState({verification_2: false});
                        } else {
                            console.log("Verified");
                            this.setState({verification_2: true});
                        }
                    } else {
                        console.log(res.data);
                        //this.props.logoutUser();
                    }
                }).catch((err) => {
                    if (err.status !== "404") {
                        this.props.logoutUser();
                    }
                });

            } else {

            }

        } else {

            axios.get(baseURL + `/api/u/security/check-point`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Headers': 'x-access-token',
                    'x-access-token': localStorage.getItem("jwtToken")
                }
            }).then((res) => {
                //console.log(res.data.email);
                //if (res.data.length === 1) {
                console.log(res.data.email);
                if (res.data.email) {
                    let verification = res.data.verification;
                    if (verification === 0) {
                        console.log("Unverified");
                        this.setState({verification: false});
                    } else {
                        console.log("Verified");
                        this.setState({verification: true});
                    }
                } else {
                    this.props.logoutUser();
                }
            }).catch((err) => {
                if (err.status !== "404") {
                    this.props.logoutUser();
                }
            });

        }

    }

    render() {

        const {user} = this.props.auth;

        return (
            <div className={"nav-master-div"} style={{position: 'absolute'}}>
                {
                    this.state.verification === false ?
                        <Redirect to="/verification"/> :
                        id === 'verification' && this.state.verification_2 === true ?
                            <Redirect to="/dashboard"/> : ""
                }
                <nav
                    className="navbar navbar-expand-lg top-space navbar-light bg-white header-light fixed-top navbar-boxed header-reverse-scroll new-navbar"
                    style={{boxShadow: "0px 1px 12px #00000012"}}>
                    <div className="container-fluid nav-header-container">
                        <div className="col-6 col-lg-2 me-auto ps-lg-0">
                            <a className="navbar-brand" href="/">
                                <img src="/img/nav-logo-word.png" data-at2x="/img/nav-logo-word.png"
                                     className="default-logo" style={{width: "140px"}} alt=""/>
                            </a>
                        </div>
                        <div className="col-auto menu-order px-lg-0">
                            <button className="navbar-toggler float-end" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarNav" aria-controls="navbarNav"
                                    aria-label="Toggle navigation">
                                <span className="navbar-toggler-line"/>
                                <span className="navbar-toggler-line"/>
                                <span className="navbar-toggler-line"/>
                                <span className="navbar-toggler-line"/>
                            </button>
                            <div className=" collapse navbar-collapse justify-content-center" id="navbarNav">
                                <ul className="navbar-nav alt-font">
                                    <li className="nav-item dropdown megamenu">
                                        <a href="/" className="nav-link">Home</a>
                                    </li>

                                    {user.role === 1 ?
                                        <li className="nav-item dropdown megamenu">
                                            <a href="/admin" className="nav-link">Super Admin</a>
                                        </li>
                                        :
                                        user.role === 2 ?
                                            <li className="nav-item dropdown megamenu">
                                                <a href="/instructor" className="nav-link">Admin level 2</a>
                                            </li>
                                            :
                                            <li className="nav-item dropdown megamenu">
                                                <a href="/dashboard" className="nav-link">Dashboard</a>
                                            </li>
                                    }

                                    {user.name ?
                                        ""
                                        :
                                        <li className="nav-item dropdown simple-dropdown">
                                            <a href="/login" className="nav-link">
                                                    <span
                                                        className={"section-link btn btn-fancy btn-very-small btn-gradient-tan-geraldine btn-round-edge-small"}>Sign in</span>
                                            </a>
                                        </li>
                                    }
                                    {user.name ?
                                        user.role === 1 ?
                                            ""
                                            :
                                            user.role === 2 ?
                                                ""
                                                :
                                                <li className="nav-item dropdown simple-dropdown user-nav-li">


                                                    <a href="/user/settings/password" title={"Settings"}
                                                       className="nav-link">
                                                            <span
                                                                className={"nav-user-actions"}>
                                                                <span className="material-icons-outlined">
                                                                    <span className="material-icons-outlined">
                                                                        settings
                                                                    </span>
                                                                </span>
                                                            </span>
                                                    </a>


                                                </li>
                                        :
                                        ""
                                    }
                                    {user.name ?
                                        <li className="nav-item dropdown simple-dropdown user-nav-li">
                                            <button style={{
                                                maxHeight: "20px",
                                                backgroundColor: "transparent",
                                                outline: "none",
                                                border: "none"
                                            }} title={"Logout"} className="nav-link"
                                                    onClick={this.onLogoutClick}>

                                                {this.state.logoutLoading === true ?
                                                    <CircularProgress style={{
                                                        color: "#232323",
                                                        padding: "10px",
                                                        marginTop: "-10px"
                                                    }}/>
                                                    :
                                                    <span
                                                        className={"nav-user-actions"}>
                                                        <span className="material-icons-outlined">
                                                            logout
                                                        </span>
                                                    </span>
                                                }

                                            </button>
                                        </li>
                                        :
                                        <li className="nav-item dropdown simple-dropdown">
                                            <a href="/register" className="nav-link">
                                                    <span
                                                        className={"section-link btn btn-fancy btn-very-small btn-gradient-tan-geraldine btn-round-edge-small"}>Sign up</span>
                                            </a>
                                        </li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}

Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    {logoutUser}
)(Navbar);


//export default Navbar;
