import React, { Component } from 'react';
import get_web3 from './components/get_web3.js';

import MetaCoin_abi from './contracts/MetaCoin.abi.json';
import MetaCoin_deployments from './contracts/MetaCoin.deployed.json';

import logo from './metacoin.png';
import './App.css';

class App extends Component {

  constructor(props) {
     super(props);
     this.disabled = true;
     this._handleLoad = this.handleLoad.bind(this);
     this._handleUserInput = this.handleUserInput.bind(this);
     this._sendCoin = this.sendCoin.bind(this);
     this.state = {
       status_message: "",
       metacoin_balance: 0,
       amount: "",
       recipient: ""
     };
  }

  componentDidMount() {
     window.addEventListener('load', this._handleLoad);
  }

  handleLoad() {
    this.web3 = get_web3();
    this.web3.eth.getAccounts((error, accounts) => {
      if (error || (accounts.length === 0)){
        this.setState({status_message: "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."});
        return;
      }
      this.accounts = accounts;
      this.account = accounts[0];

      // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3versionnetwork
      // https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#construction_worker-network-check
      this.web3.version.getNetwork((error, net_version) => {
        if (error){
          this.setState({status_message: "Couldn't get Ethereum network id!"});
          return;
        }
        this.net_version = net_version;

        this.initMetaCoin();
      })
    });
  }

  initMetaCoin(){
    if (
      (typeof MetaCoin_deployments !== 'object') ||
      (MetaCoin_deployments === null) ||
      (typeof MetaCoin_deployments[this.net_version] === 'undefined') ||
      (! Array.isArray( MetaCoin_deployments[this.net_version] )) ||
      (MetaCoin_deployments[this.net_version].length === 0)
    ){
      this.setState({status_message: "Couldn't determine the contract address for MetaCoin deployment on the current Ethereum network! Make sure the contract is deployed before running the Dapp."});
      return;
    }
    this.MetaCoin_contract_address = MetaCoin_deployments[this.net_version];
    this.MetaCoin_contract = this.web3.eth.contract( MetaCoin_abi );
    this.MetaCoin = this.MetaCoin_contract.at( this.MetaCoin_contract_address[0] );

    this.disabled = false;

    this.refreshBalance();
  }

  handleUserInput(event){
    var dom_node = event.target;
    var key = dom_node.id;
    var val = dom_node.value;
    var new_state = {};

    new_state[key]=val;
    this.setState(new_state);
  }

  resetUserInput(){
    this.setState({
      amount: "",
      recipient: ""
    });
  }

  refreshBalance(){
    if (this.disabled){return;}

    this.MetaCoin.getBalance.call(this.account, {from: this.account}, (error, BigNumber_metacoin_balance) => {
      var metacoin_balance;
      if (error){
        this.setState({status_message: "Error getting balance; see log."});
      }
      else {
        metacoin_balance = BigNumber_metacoin_balance.toString(10);
        this.setState({metacoin_balance: metacoin_balance});
      }
    });
  }

  sendCoin(){
    if (this.disabled){return;}

    var amount, recipient;
    recipient = this.state.recipient;
    if (recipient){
      amount = parseInt(this.state.amount, 10)
      if (amount && (amount > 0)){
        this.setState({status_message: "Initiating transaction... (please wait)"});
        this.MetaCoin.sendCoin(recipient, amount, {from: this.account}, (error, sufficient) => {
          if (error){
            this.setState({status_message: "Error sending coin; see log."});
          }
          else if (! sufficient){
            this.setState({status_message: "Insufficient funds."});
          }
          else {
            this.setState({status_message: "Transaction complete!"});
            this.resetUserInput();
            this.refreshBalance();
          }
        });
      }
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>MetaCoin</h1>
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Example Dapp built with ReactJS + Sass + Webpack</h2>
        </div>
        <div className="App-intro">
          <h3>You have <span className="black"><span id="balance">{this.state.metacoin_balance}</span> META</span></h3>

          <h1>Send MetaCoin</h1>
          <br /><label htmlFor="amount">Amount:</label><input type="text" id="amount" value={this.state.amount} onChange={this._handleUserInput} placeholder="e.g., 95"></input>
          <br /><label htmlFor="receiver">To Address:</label><input type="text" id="recipient" value={this.state.recipient} onChange={this._handleUserInput} placeholder="e.g., 0x93e66d9baea28c17d9fc393b53e3fbdd76899dae"></input>
          <br /><br /><button id="send" onClick={this._sendCoin}>Send MetaCoin</button>
          <br /><br /><span id="status">{this.state.status_message}</span>
          <br /><span className="hint"><strong>Hint:</strong> open the browser developer console to view any errors and warnings.</span>
        </div>
      </div>
    );
  }

}

export default App;
