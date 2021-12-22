import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";
import {Redirect} from "react-router-dom";
import axios from "axios";
import {CircularProgress} from "@material-ui/core";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {Helmet} from "react-helmet";
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

//axios.defaults.baseURL = process.env.APP_URL
const baseURL = require("../../config/keys").API_URL;

let pathname = window.location.pathname;
let course = pathname.split('/').pop();

class Dashboard extends Component {

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    state = {
        courses: [],
        skeleton: false,
        process: false,
        successOpen: false,
        paymentStatus: []
    }

    componentDidMount = () => {
        // get course information
        this.setState({skeleton: true});
        axios.get(baseURL + `/api/u/course?course=` + course, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'x-access-token',
                'x-access-token': localStorage.getItem("jwtToken")
            }
        }).then((res) => {
            const courses = res.data;
            //console.log(courses);
            this.setState({skeleton: false});
            this.setState({courses});
        }).catch((err) => {
            this.setState({skeleton: false});
            this.setState({loading: false}, () => {
            });
        });

        // check payment
        axios.get(baseURL + `/api/u/payment-check?course=` + course, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'x-access-token',
                'x-access-token': localStorage.getItem("jwtToken")
            }
        }).then((res) => {
            const paymentStatus = res.data;
            //console.log(paymentStatus);
            this.setState({paymentStatus});
        }).catch((err) => {
            this.setState({loading: false}, () => {
            });
        });

    }

    reload = e => {
        window.location.reload();
    }

    onSubmitDel = e => {
            console.log("resend");

            this.setState({process: true});
            this.setState({successOpen: false});

            // delete payment
            axios.post(baseURL + `/api/u/resend-verification`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Headers': 'x-access-token',
                    'x-access-token': localStorage.getItem("jwtToken")
                }
            }).then((response) => {
                console.log("resent");
                this.setState({process: false});
                this.setState({successOpen: true});
                //window.location.href = "/verification";
                //this.setState({persons});
            }).catch((err) => {
                this.setState({process: false});
                this.setState({successOpen: false});
                console.log(err);
                //this.setState({loading: false}, () => {
                //});
            });
            // axios end




        e.preventDefault();

        // this.props.registerUser(newCourse);
        // this.props.registerUser(newCourse, this.props.history);
    };

    handleClose = () => {
        this.setState({successOpen: false})
    }


    render() {

        const {user} = this.props.auth;

        if (user.role === 1) {
            return <Redirect to="/admin"/>
        } else if (user.role === 2) {
            return <Redirect to="/instructor"/>
        } else {

            let paymentStatus = this.state.paymentStatus.map(status => status.status);
            if (paymentStatus[0] === 1) {
                // payment pass
                return <Redirect to={"/course/" + course + "?t="}/>
            }

            return (
                <div className={"mother"}>
                    <Helmet>
                        <title>Coduza mernBase</title>
                        <meta name="robots" content="noindex" />
                    </Helmet>
                    <Snackbar
                        open={this.state.successOpen}
                        autoHideDuration={6000}
                        onClose={this.handleClose}
                    >
                        <Alert
                            //onClose={handleClose}
                            severity="success"
                            sx={{width: '100%'}}
                        >
                            Verification email resent!
                        </Alert>
                    </Snackbar>
                    <div className="container valign-wrapper">
                        <div className="row">
                            <div className="landing-copy col s12 center-align">


                                <div id={"head-topic"}>
                                    <div style={{display: "inline-block", marginRight: "10px"}}>
                                        <a href={"/verification"}
                                           className="btn icon-master-btn con-mid" style={{marginTop: "10px"}}>
                                            <i className="material-icons-outlined btn-icon">arrow_back</i>
                                        </a>
                                    </div>
                                    <div style={{display: "inline-block", marginRight: "10px"}}>
                                        <h4>Pending Verification</h4>
                                    </div>
                                </div>


                                <div className={"con-mid"} style={{width: "100%", margin: "30px 0 100px"}}>
                                    <div className={"form-box"}>
                                        <div className={"form-inner"}>
                                            <div style={{marginBottom: "24px"}}>

                                                <h4 key={course.name}>{user.email}</h4>

                                                <p style={{fontSize: "14px", marginBottom: "0px"}}>
                                                    <b>Email verification is pending</b>
                                                </p>
                                            </div>
                                            <div style={{marginBottom: "24px"}}>
                                                <button
                                                    style={{
                                                        width: "150px",
                                                    }}
                                                    onClick={this.reload}
                                                    className="btn btn-full-dark"
                                                >
                                                    Check now
                                                </button>
                                            </div>
                                            <div style={{marginBottom: "24px"}}>
                                                <button
                                                    style={{
                                                        width: "150px",
                                                        height: "35px"
                                                    }}
                                                    onClick={this.onSubmitDel}
                                                    className="btn btn-full-blue"
                                                >
                                                    {this.state.process === true ?
                                                        <CircularProgress style={{
                                                            color: "#ffffff",
                                                            padding: "10px",
                                                            marginTop: "-10px"
                                                        }}/> : "Resend"
                                                    }
                                                </button>
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
                                    <a href="./" className="footer-logo"><img
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
