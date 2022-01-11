import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";
import axios from "axios";
import {CircularProgress} from "@material-ui/core";
import {Helmet} from "react-helmet";

//axios.defaults.baseURL = process.env.APP_URL
const baseURL = require("../../config/keys").API_URL;

let pathname = window.location.pathname;
let id = pathname.split('/').pop();

class Dashboard extends Component {

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    state = {
        loading: false,
        verification: "",
    }

    componentDidMount = () => {

        // get course information
        this.setState({loading: true});

        axios.get(baseURL + `/api/users/accept-verification?id=` + id, {}).then((res) => {

            this.setState({loading: false});
            //const verification = res.data;
            this.setState({verification: true});

        }).catch((err) => {
            this.setState({loading: false});
            this.setState({verification: false});
        });

    }

    render() {
        return (
            <div className={"mother"}>
                <Helmet>
                    <title>Coduza mernBase</title>
                    <meta name="robots" content="noindex" />
                </Helmet>
                <div className="container valign-wrapper">
                    <div className="row">
                        <div className="landing-copy col s12 center-align">


                            <div id={"head-topic"}>
                                <div style={{display: "inline-block", marginRight: "10px"}}>
                                    <a href={"/login"}
                                       className="btn icon-master-btn con-mid" style={{marginTop: "10px"}}>
                                        <i className="material-icons-outlined btn-icon">arrow_back</i>
                                    </a>
                                </div>
                                <div style={{display: "inline-block", marginRight: "10px"}}>
                                    <h4>Email Verification</h4>
                                </div>
                            </div>


                            <div className={"con-mid"} style={{width: "100%", margin: "30px 0 100px"}}>
                                <div className={"form-box"}>
                                    <div className={"form-inner"}>
                                        <div style={{marginBottom: "24px"}}>

                                            {this.state.loading === true ?
                                                <div style={{width: "100%"}} className={"con-mid"}>
                                                    <CircularProgress/>
                                                </div>
                                                :
                                                this.state.verification === true ?
                                                    <p style={{fontSize: "14px", marginBottom: "0px"}}>
                                                        <b>
                                                            <span className="material-icons-outlined"
                                                                  style={{color: "rgb(36,96,40)", marginRight: "5px"}}>check_circle</span>
                                                            <br/>
                                                            You have successfully verified account
                                                        </b>
                                                    </p>
                                                    :
                                                    <p style={{fontSize: "14px", marginBottom: "0px"}}>
                                                        <b>
                                                            <span className="material-icons-outlined"
                                                                  style={{color: "rgba(0, 0, 0, 0.5)", marginRight: "5px"}}>cancel</span>
                                                            <br/>
                                                            Expired verification
                                                        </b>
                                                    </p>

                                            }

                                        </div>
                                        <div style={{marginBottom: "24px"}}>
                                            <a
                                                style={{
                                                    width: "150px",
                                                }}
                                                href={"/login"}
                                                className="btn btn-full-blue"
                                            >
                                                Next

                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* start section */}
                <section
                    className="padding-100px-tb md-padding-75px-tb sm-padding-50px-tb wow animate__fadeIn footer-contact">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div
                                className="col-12 col-xl-5 col-lg-4 md-margin-50px-bottom sm-margin-30px-bottom last-paragraph-no-margin wow animate__fadeIn"
                                data-wow-delay="0.6s">
                                <h5 className="alt-font font-weight-500 text-dark-purple w-70 d-inline-block letter-spacing-minus-1px m-0 lg-w-100 md-w-50 xs-w-70">
                                    Please feel free to get in touch with us</h5>
                            </div>
                            {/* start feature box item */}
                            <div
                                className="col-12 col-xl-3 col-lg-4 col-sm-6 xs-margin-30px-bottom last-paragraph-no-margin wow animate__fadeInRight"
                                data-wow-delay="0.4s">
                                <div className="feature-box feature-box-left-icon">
                                    <div className="feature-box-icon margin-5px-top">
                                        <i className="line-icon-Geo2-Love icon-extra-medium text-salmon-rose d-block"/>
                                    </div>
                                    <div className="feature-box-content">
                                        <span
                                            className="text-dark-purple text-uppercase text-medium font-weight-500 alt-font margin-5px-bottom d-block">Coduza mernBase</span>
                                        <p className="m-0">165A, Weliwita Junction, New Kandy Road, Malabe, Sri
                                            Lanka</p>
                                    </div>
                                </div>
                            </div>
                            {/* end feature box item */}
                            {/* start feature box item */}
                            <div
                                className="col-12 col-xl-3 offset-xl-1 col-lg-4 col-sm-6 last-paragraph-no-margin wow animate__fadeInRight"
                                data-wow-delay="0.6s">
                                <div className="feature-box feature-box-left-icon">
                                    <div className="feature-box-icon margin-5px-top">
                                        <i className="line-icon-Mail icon-extra-medium text-salmon-rose d-block"/>
                                    </div>
                                    <div className="feature-box-content">
                                        <span
                                            className="text-dark-purple text-uppercase text-medium font-weight-500 alt-font margin-5px-bottom d-block">How can we help?</span>
                                        <p className="m-0"><a href="mailto:info@votechno.com"
                                                              className="text-salmon-rose-hover">info@votechno.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* end features box item */}
                        </div>
                    </div>
                </section>
                {/* end section */}
                {/* start footer */}
                <footer className="footer-light border-top border-color-medium-gray padding-50px-tb">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-12 col-md-3 text-center text-md-start sm-margin-20px-bottom">
                                <a href="/" className="footer-logo"><img
                                    src="/img/nav-logo-word.png"
                                    data-at2x="/img/nav-logo-word.png" alt=""/></a>
                            </div>
                            <div
                                className="col-12 col-md-6 text-center last-paragraph-no-margin sm-margin-20px-bottom">
                                <p className={"legal-footer-text"}>
                                    <strong>©</strong><span>{new Date().getFullYear()}</span> Coduza mernBase -
                                    Powered by <a
                                    href="https://www.coduza.com/"
                                    className="text-decoration-line-bottom text-extra-dark-gray text-salmon-rose-hover font-weight-500">CODUZA</a>
                                </p>
                            </div>
                            <div className="col-12 col-md-3 text-center text-md-end">
                                <div className="social-icon-style-12">
                                    <ul className="extra-small-icon">
                                        <li key={"key-1"}><a className="facebook"
                                                             href="https://www.facebook.com/Votechno/"
                                                             rel="noopener noreferrer" target="_blank"><i
                                            className="fab fa-facebook-f"/></a></li>
                                        <li key={"key-2"}><a className="linkedin"
                                                             href="https://www.linkedin.com/in/votechno-institute/"
                                                             rel="noopener noreferrer" target="_blank"><i
                                            className="fab fa-linkedin"/></a></li>
                                        <li key={"key-3"}><a className="instagram"
                                                             href="https://www.instagram.com/votechno_institute/"
                                                             rel="noopener noreferrer" target="_blank"><i
                                            className="fab fa-instagram"/></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
                {/* end footer */}
            </div>
        );
    }
}

Dashboard.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    {logoutUser}
)(Dashboard);
