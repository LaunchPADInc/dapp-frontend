// https://angular.io/docs/ts/latest/guide/reactive-forms.html
// https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html
// https://angular.io/docs/ts/latest/guide/webpack.html

import { Component, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'

import get_web3 from './components/get_web3'

import MetaCoin_abi from '../contracts/MetaCoin.abi.json'
import MetaCoin_deployments from '../contracts/MetaCoin.deployed.json'

import logo from '../assets/images/metacoin.png'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    '(window:load)': 'handleLoad()'
  }
})
export class AppComponent {
  disabled: boolean
  logo: any
  web3: any
  net_version: string
  accounts: string[]
  account: string
  MetaCoin_contract_address: string
  MetaCoin_contract: any
  MetaCoin: any

  form_SendMetaCoin: FormGroup
  status_message: string
  metacoin_balance: number

  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.disabled = true
    this.logo = logo

    this.createForm()
    this.status_message = ''
    this.metacoin_balance = 0
  }

  createForm() {
    this.form_SendMetaCoin = this.fb.group({
      amount: '',
      recipient: ''
    })
  }

  handleLoad() {
    this.web3 = get_web3()
    this.web3.eth.getAccounts((error, accounts) => {
      if (error || (accounts.length === 0)){
        this.status_message = "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
        return
      }
      this.accounts = accounts
      this.account = accounts[0]

      // https://github.com/ethereum/wiki/wiki/JavaScript-API#web3versionnetwork
      // https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#construction_worker-network-check
      this.web3.version.getNetwork((error, net_version) => {
        if (error){
          this.status_message = "Couldn't get Ethereum network id!"
          return
        }
        this.net_version = net_version

        this.initMetaCoin()
      })
    })
  }

  initMetaCoin(){
    if (
      (typeof MetaCoin_deployments !== 'object') ||
      (MetaCoin_deployments === null) ||
      (typeof MetaCoin_deployments[this.net_version] === 'undefined') ||
      (! Array.isArray( MetaCoin_deployments[this.net_version] )) ||
      (MetaCoin_deployments[this.net_version].length === 0)
    ){
      this.status_message = "Couldn't determine the contract address for MetaCoin deployment on the current Ethereum network! Make sure the contract is deployed before running the Dapp."
      return
    }
    this.MetaCoin_contract_address = MetaCoin_deployments[this.net_version]
    this.MetaCoin_contract = this.web3.eth.contract( MetaCoin_abi )
    this.MetaCoin = this.MetaCoin_contract.at( this.MetaCoin_contract_address[0] )

    this.disabled = false

    this.refreshBalance(true)
  }

  refreshBalance(is_external_event_handler){
    if (this.disabled){return}

    this.MetaCoin.getBalance.call(this.account, {from: this.account}, (error, BigNumber_metacoin_balance) => {
      if (error){
        this.status_message = "Error getting balance; see log."
      }
      else {
        this.metacoin_balance = BigNumber_metacoin_balance.toString(10)

        if (is_external_event_handler) this.cdRef.detectChanges()
      }
    })
  }

  sendCoin(){
    if (this.disabled){return}

    var amount, recipient
    recipient = this.form_SendMetaCoin.get('recipient').value
    if (recipient){
      amount = parseInt(this.form_SendMetaCoin.get('amount').value, 10)
      if (amount && (amount > 0)){
        this.status_message = "Initiating transaction... (please wait)"
        this.MetaCoin.sendCoin(recipient, amount, {from: this.account}, (error, sufficient) => {
          if (error){
            this.status_message = "Error sending coin; see log."
          }
          else if (! sufficient){
            this.status_message = "Insufficient funds."
          }
          else {
            this.status_message = "Transaction complete!"
            this.form_SendMetaCoin.reset()
            this.refreshBalance(false)
          }
        })
      }
    }
  }

}
