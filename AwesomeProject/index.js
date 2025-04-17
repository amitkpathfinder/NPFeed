import { AppRegistry, Text } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Error boundary
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

// Display errors
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    if (args[0]?.includes?.('Unhandled JS Exception')) {
      alert('Error: ' + JSON.stringify(args));
    }
  };
}

AppRegistry.registerComponent(appName, () => App);