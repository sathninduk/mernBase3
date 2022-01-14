import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {loginUser} from "../../actions/authActions";
import {TextField} from "@material-ui/core"
import classnames from "classnames";
//import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "react-router-dom/Link";
import {Helmet} from "react-helmet";
import axios from "axios";
const baseURL = require("../../config/keys").API_URL;

class Login extends Component {

    constructor() {
        super();
        this.state = {
            email: "",
            loading: false,
            password: "",
            errors: {}
        };
    }

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/dashboard");
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            this.setState({loading: false});
            this.props.history.push("/dashboard");
        }

        if (nextProps.errors) {
            this.setState({loading: false});
            this.setState({
                errors: nextProps.errors
            });
        }
    }

    onChange = e => {
        this.setState({[e.target.id]: e.target.value});
    };

    onSubmit = async e => {
        this.setState({loading: true});
        e.preventDefault();

        const userData = {
            email: this.state.email,
            password: this.state.password
        };

        this.props.loginUser(userData);
    };

    render() {
        const {errors} = this.state;

        return (
            <div className={"mother login-mother con-mid"}>
                <Helmet>
                    <title>Login</title>
                </Helmet>
                <div>
                    <style>{"\
                        .navbar {\
                            display: none !important;\
                        }\
                    "}
                    </style>
                    {/*this.state.loading === true ?
                    <LinearProgress style={{zIndex: "1000000"}}/> : ""
                */}
                    <div className="container">
                        <div className="row">
                            <div className="col s8 offset-s2">

                                <div className={"login-card form-card con-mid"}>
                                    <div className={"form-box login-box"}
                                         style={{
                                             backgroundColor: "rgba(0,0,0,0)",
                                             boxShadow: "none",
                                             borderRadius: "10px",
                                             border: "none"
                                         }}>
                                        <div className={"form-inner"}
                                             style={{
                                                 backgroundColor: "rgba(0,0,0,0)",
                                                 boxShadow: "none",
                                                 border: "none"
                                             }}>
                                            <div className="col s12">

                                                <div style={{width: "100%", height: "60px", marginBottom: "20px"}}
                                                     className={"con-mid"}>
                                                    <a href={'/'} target={"_self"}>
                                                        <img src={"/img/nav-logo-word.png"}
                                                             title="Coduza mernBase"
                                                             alt={"votechno logo"} style={{width: "200px"}}/>
                                                    </a>
                                                </div>

                                                <h4 style={{
                                                    color: "#000000",
                                                    background: "none",
                                                    WebkitTextFillColor: "#000000",
                                                    textAlign: "left",
                                                    marginBottom: "-5px"
                                                }}>
                                                    <b>Sign in</b>
                                                </h4>
                                                <p className="grey-text text-darken-1"
                                                   style={{fontSize: "14px", padding: "10px 0 0 0"}}>
                                                    Don't have an account? <Link to="/register" style={{
                                                    color: "#007FFF",
                                                    textDecoration: "none"
                                                }}>Register</Link>
                                                </p>
                                            </div>

                                            <form noValidate onSubmit={this.onSubmit}>
                                                <div className="input-field col s12" style={{marginBottom: "24px"}}>
                                                    <TextField
                                                        id="email"
                                                        label="Email"
                                                        variant="filled"
                                                        type="email"
                                                        onChange={this.onChange}
                                                        value={this.state.email}
                                                        error={errors.email}
                                                        style={{width: "100%"}}
                                                        className={classnames("", {
                                                            invalid: errors.email || errors.emailnotfound
                                                        })}
                                                    />
                                                    <span
                                                        className="red-text">{errors.email}{errors.emailnotfound}</span>
                                                </div>
                                                <div className="input-field col s12">
                                                    <TextField
                                                        id="password"
                                                        label="Password"
                                                        variant="filled"
                                                        type="password"
                                                        onChange={this.onChange}
                                                        value={this.state.password}
                                                        error={errors.password}
                                                        style={{width: "100%"}}
                                                        className={classnames("", {
                                                            invalid: errors.password || errors.passwordincorrect
                                                        })}
                                                    />
                                                    <span
                                                        className="red-text">{errors.password}{errors.passwordincorrect}</span>
                                                    <p className="grey-text text-darken-1">
                                                        <Link className={"forgot-pw"} to="/forgot">Forgot
                                                            Password?</Link>
                                                    </p>
                                                </div>
                                                <div className="col s12">
                                                    <button
                                                        style={{
                                                            width: "100%",
                                                            marginTop: "1rem",
                                                            height: "48px"
                                                        }}
                                                        type="submit"
                                                        className="btn btn-full-blue"
                                                    >
                                                        {this.state.loading === true ?
                                                            <CircularProgress style={{
                                                                color: "#ffffff",
                                                                padding: "10px",
                                                                marginTop: "-3px"
                                                            }}/> : "Sign in"
                                                        }
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    {loginUser}
)(Login);
