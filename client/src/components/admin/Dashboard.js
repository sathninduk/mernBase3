import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";
import {Redirect} from "react-router-dom";
import {Button} from "@material-ui/core";
import {Helmet} from "react-helmet";

class Dashboard extends Component {

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {

        const {user} = this.props.auth;

        if (user.role === 3) {
            return <Redirect to="/dashboard"/>
        } else if (user.role === 2) {
            return <Redirect to="/instructor"/>
        } else {

            return (
                <div className={"mother"} style={{minHeight: "calc(100vh - 60px)"}}>
                    <Helmet>
                        <title>Admin | Coduza mernBase</title>
                        <meta name="robots" content="noindex" />
                    </Helmet>
                    <div className="container valign-wrapper">
                        <div className={"container landing-copy"} style={{marginBottom: "50px"}}>
                            <div style={{width: "100%", marginBottom: "50px", paddingTop: "50px"}}
                                 className={"con-mid"}>
                                <h2>Admin Portal</h2>
                            </div>

                            <div className={"block-body admin-outer-blocs"}>
                                <div className={"inner-block-body"}>
                                    <div className={"row blocs admin-blocs"}>
                                        <div>
                                            <p className={"bold-text"}>User Management</p>
                                        </div>
                                        <div className={"col-sm-4"}>
                                            <Button href={"/admin/users"} variant="outlined"
                                                    className={"admin-box"}>
                                                <div style={{width: "100%"}} className={"con-left"}>Users</div>
                                                <div style={{width: "100%"}} className={"con-right right-admin-icon"}>
                                                    <i className="material-icons-outlined">
                                                        people
                                                    </i>
                                                </div>
                                            </Button>
                                        </div>
                                        <div className={"col-sm-4"}>
                                            <Button href={"/admin/instructors"} variant="outlined"
                                                    className={"admin-box"}>
                                                <div style={{width: "100%"}} className={"con-left"}>Instructors</div>
                                                <div style={{width: "100%"}} className={"con-right right-admin-icon"}>
                                                    <i className="material-icons-outlined">
                                                        record_voice_over
                                                    </i>
                                                </div>
                                            </Button>
                                        </div>
                                        <div className={"col-sm-4"}>
                                            <Button href={"/admin/super-admins"} variant="outlined"
                                                    className={"admin-box"}>
                                                <div style={{width: "100%"}} className={"con-left"}>Admins</div>
                                                <div style={{width: "100%"}} className={"con-right right-admin-icon"}>
                                                    <i className="material-icons-outlined">
                                                        admin_panel_settings
                                                    </i>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        <div className={"con-mid"} style={{width: "100%", marginBottom: "50px"}}>
                            <p>
                                Powered by <a target={"_self"} href={"https://www.coduza.com/"}>CODUZA</a>
                            </p>
                        </div>

                    </div>
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
