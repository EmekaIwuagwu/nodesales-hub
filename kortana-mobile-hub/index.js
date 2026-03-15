import 'react-native-get-random-values';
import '@walletconnect/react-native-compat';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Buffer } from 'buffer';

global.Buffer = Buffer;
process.browser = true;

AppRegistry.registerComponent(appName, () => App);
