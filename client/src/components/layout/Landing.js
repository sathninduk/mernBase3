import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";

import {Helmet} from "react-helmet";

//const baseURL = require("../../config/keys").API_URL;

class Landing extends Component {

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {
        return (
            <div style={{backgroundColor: "#ffffff"}}>
                <Helmet>
                    <title>Coduza mernBase</title>
                </Helmet>
                <div style={{width: "100vw", height: "100vh"}} className={"con-mid"}>
                    <h1>
                        Coduza mernBase
                    </h1>
                </div>
            </div>
        );
    }
}

Landing.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    {logoutUser}
)(Landing);
