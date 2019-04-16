import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import GoogleMapReact from 'google-map-react';
import ENV from './config/config.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName:"",
      lastName:'',
      latitude: 0,
      longitude: 0
    }
  }

  getData = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  getLocation = (e) => {
    e.preventDefault();
    console.log(this.state);
    this.setState({
      latitude: 0,
      longitude: 0
    })
    axios.get(ENV.BACKEND_IP+'/getLocation', {
      params: {
        firstName: this.state.firstName,
        lastName: this.state.lastName
      }
    }).then(response => {
      console.log(response.data);
      if (response.status == 200) {
        this.setState({
          latitude: response.data.latitude,
          longitude: response.data.longitude
        })
      }
    }).catch(error => {
      alert("user not found");
      console.log("RESPONSE CODE 400")
      this.setState({
        status: 400,
        firstName:"",
        lastName:""
      })
    });
  }


  render() {
    const Marker = ({ text }) => <div><span><i class="fa fa-map-marker" style={{fontSize:'30px',color:'#ED2939'}}></i>{text}</span></div>;
    return (
      <div className="App">
        <center>
          <div class="col-md-6" style={{ marginTop:'20%'}}>
            <form class="">
              <div class="form-group row">
                <label class="col-sm-2" for="firstName">First Name</label>
                <div className="col-sm-10">
                  <input onChange={this.getData} className="form-control" type="text" id="firstName" name="firstName" />
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-2" for="lastName">Last Name</label>
                <div className="col-sm-10">
                  <input onChange={this.getData} className="form-control" type="text" id="lastName" name="lastName" />
                </div>
              </div>
              <div className="form-group row">
                <button onClick={this.getLocation} className="btn btn-primary">Locate !</button>
              </div>
            </form>
            <div className="row">
                <label>Sample names from the file.</label>
                <p>DANIEL KESSLER</p>
                <p>RICHARD JONES</p>
                <p>PAUL KAUFMAN</p>
                <p>DONALD LEWIS</p>
                <p>Raza Khan</p>
              </div>
          </div>
          <div className="col-md-6" style={{ height: '500px', width: '500px',marginTop:'10%'}}>
          <GoogleMapReact
              bootstrapURLKeys={{ key: ENV.MY_API_KEY }}
              center={{
                lat: this.state.latitude,
                lng: this.state.longitude
              }}
              defaultZoom={15}
            >
              <Marker
                lat={this.state.latitude}
                lng={this.state.longitude}
                text={this.state.firstName+" "+this.state.lastName}
              />
            </GoogleMapReact>
          </div>
        </center>
      </div>
    );
  }
}

export default App;
