import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import AuthenticationService from "./AuthenticationService";
import UISegmentWithHeader from "./UISegmentWithHeader";
import UITextField from "./UITextField";
import UICardItem from "./UICardItem";
import UICountryField from "./UICountryField";

const Account = () => {
    const [fullname, setFullname] = useState("");
    const [country, setCountry] = useState("");
    const [language, setLanguage] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [company, setCompany] = useState("");
    const [profileStatus, setProfileStatus] = useState(false);
    
    const [currentPin, setCurrentPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [pinStatus, setPinStatus] = useState(null);
    const [pinError, setPinError] = useState(false);

    const [interests, setInterests] = useState([]);

    const history = useHistory();

    const saveProfile = (e) => {
        e.preventDefault();
        let profile = {
            fullname: fullname,
            country: country,
            language: language,
            birthdate: birthdate,
            company: company
        };
        
        let result = AuthenticationService.set("profile", profile);
        if (result["status"] !== "OK") {
            AuthenticationService.sessionDestroy();
            history.push("/");
        }
        setProfileStatus(true);
        
        setTimeout(() => {
            setProfileStatus(false);
        }, 1000);
    };

    const changePin = (e) => {
        e.preventDefault();
        
        if (!AuthenticationService.passwordVerify(currentPin)) {
            setPinError(true);
            setPinStatus("Invalid PIN provided");
            pinTimeoutStatus();
            return;
        }

        if (newPin !== confirmPin) {
            setPinError(true);
            setPinStatus("New PIN does not match");
            pinTimeoutStatus();
            return;
        }

        if (!AuthenticationService.passwordChange(currentPin, confirmPin)) {
            setPinError(true);
            setPinStatus("Invalid PIN");
            pinTimeoutStatus();
            return;
        }

        setPinStatus("PIN Changed");
        pinTimeoutStatus();
    };

    const renderInterest = () => {
        if (interests.length === 0) {
            return <div className="ui message yellow">No interest selected yet</div>;
        } else {
            return (
                <div className="ui cards h-400 overflow">
                    {interests.map((interest, index) => <UICardItem key={index} title={interest.name} meta={interest.type} />)}
                </div>
            )
        }
    };

    const clearTrainingData = (e) => {
        e.preventDefault();
        AuthenticationService.delete("training");
    };

    const pinTimeoutStatus = () => {
            setTimeout(() => {
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
            setPinError(false);
            setPinStatus(null);
        }, 1000)
    };

    const loadProfileData = useCallback(() => {
        let data = AuthenticationService.get("profile");
        if (data["status"] !== "OK") {
            AuthenticationService.sessionDestroy();
            history.push("/");
        }
        data = data["data"];
        setFullname(data["fullname"] ? data["fullname"] : "");
        setCountry(data["country"] ? data["country"] : "");
        setLanguage(data["language"] ? data["language"] : "");
        setBirthdate(data["birthdate"] ? new Date(data["birthdate"]) : new Date());
        setCompany(data["company"] ? data["company"] : "");
    }, [history]);

    const loadInterestsList = useCallback(() => {
        let data = AuthenticationService.get("interests");
        if (data["status"] !== "OK") {
            AuthenticationService.sessionDestroy();
            history.push("/");
        }
        data = data["data"];
        setInterests(data ? data : []);
    }, [history]);

    useEffect(() => {
        loadProfileData();
        loadInterestsList();
    }, [history, loadProfileData, loadInterestsList]);

    return (
        <form className="ui form">
            <div className="ui tiny">
                You can provide additional information to Guru to improve your password suggestions.
                <br />
                You are in control of your data.
                <br />
                <br />
                This data is stored on your browser and is never sent to a server.
            </div>

            <UISegmentWithHeader header="Personal Information">
                <UITextField label="Full name" name="fullname" placeholder="Fullname" value={fullname} onChange={e => setFullname(e.target.value)} />
                <UICountryField label="Country" value={country} onChange={(e, {value}) => setCountry(value)} />
                <UITextField label="Language" name="language" placeholder="Language" value={language} onChange={e => setLanguage(e.target.value)} />
                <div className="field">
                    <label>Birthdate</label>
                    <DatePicker dateFormat="yyyy-MM-dd" selected={birthdate} onChange={(date) => setBirthdate(date)} showYearDropdown />
                </div>
                <UITextField label="Company" name="company" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
                <button disabled={profileStatus} className="ui icon button green" onClick={saveProfile}><i className="save outline icon"></i></button>
                {profileStatus ? <small style={{"color": "green"}}>Saved!</small> : null}
            </UISegmentWithHeader>

            <UISegmentWithHeader header="Change Lock PIN">
                <UITextField label="Current PIN" type="password" name="currentPin" placeholder="Current PIN" value={currentPin} onChange={e => setCurrentPin(e.target.value)} />
                <UITextField label="New PIN" type="password" name="newPin" placeholder="New PIN" value={newPin} onChange={e => setNewPin(e.target.value)} />
                <UITextField label="Confirm PIN" type="password" name="confirmPin" placeholder="Confirm PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} />
                <button disabled={pinStatus} className="ui icon button green" onClick={changePin}><i className="save outline icon"></i></button>
                {pinStatus ? <small style={ !pinError ? {"color": "green"} : {"color": "red"}}>{pinStatus}</small> : null}
            </UISegmentWithHeader>

            <UISegmentWithHeader header="Interest" >
                {renderInterest()}
                <br />
                <Link className="ui button blue fluid" to="/account/interest">Manage</Link>
            </UISegmentWithHeader>
            
            <button className="ui button fluid" onClick={e => clearTrainingData(e)}>Clear Training Data</button>
        </form>
    );
}

export default Account;