import { default as Web3} from 'web3';

var get_web3 = function(){

  var my_web3;

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof window.web3 !== 'undefined') {
    console.warn("Using web3 detected from external source.")
    // Use Mist/MetaMask's provider
    my_web3 = new Web3(window.web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure.");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    my_web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  return my_web3;

}

export default get_web3;
