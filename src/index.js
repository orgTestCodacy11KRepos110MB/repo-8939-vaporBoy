// Our root component
import "./index.scss";
import { Component } from "preact";

import { Pubx } from "./services/pubx";
import { PUBX_CONFIG } from "./pubx.config";
import { WasmBoy } from "wasmboy";
import device from "current-device";

import VaporBoyDesktop from "./components/vaporboyDesktop/vaporboyDesktop";
import VaporBoyMobileLandscape from "./components/vaporboyMobileLandscape/vaporboyMobileLandscape";
import VaporBoyMobilePortrait from "./components/vaporboyMobilePortrait/vaporboyMobilePortrait";
import VaporBoyExpanded from "./components/vaporboyExpanded/vaporboyExpanded";
import ControlPanel from "./components/controlPanel/controlPanel";
import ConfirmationModal from "./components/confirmationModal/confirmationModal";
import Touchpad from "./components/touchpad/touchpad";

export default class App extends Component {
  constructor() {
    super();

    // Initialize our Pubx
    PUBX_CONFIG.INITIALIZE();

    // Add our listener for orientation changes
    device.onChangeOrientation(newOrientation => {
      Pubx.publish(PUBX_CONFIG.LAYOUT_KEY, {
        mobile: device.mobile(),
        landscape: device.landscape(),
        portrait: device.portrait()
      });
    });
  }

  componentDidMount() {
    document.addEventListener("deviceready", () => {
      console.log("Cordova Launched Device Ready!");
    });
    console.log("WasmBoy:", WasmBoy);

    // Subscribe to changes
    const pubxLayoutSubscriberKey = Pubx.subscribe(
      PUBX_CONFIG.LAYOUT_KEY,
      newState => {
        // You can spread and overwrite variables, while preserving ones,
        // as long is in cascading order.
        this.setState({
          ...this.state,
          layout: {
            ...this.state.layout,
            ...newState
          }
        });
      }
    );

    this.setState({
      layout: {
        ...Pubx.get(PUBX_CONFIG.LAYOUT_KEY)
      },
      pubxLayoutSubscriberKey
    });
  }

  render() {
    // Define our layouts
    let vaporboyDesktopLayout = <VaporBoyDesktop />;
    let vaporboyMobileLandscapeLayout = <VaporBoyMobileLandscape />;
    let vaporboyMobilePortraitLayout = <VaporBoyMobilePortrait />;
    let vaporboyExpandedLayout = <VaporBoyExpanded />;

    // Get our current layout
    let currentLayout = vaporboyDesktopLayout;
    if (device.mobile() || device.tablet()) {
      if (device.landscape()) {
        currentLayout = vaporboyMobileLandscapeLayout;
      } else {
        currentLayout = vaporboyMobilePortraitLayout;
      }
    }

    if (this.state.layout && this.state.layout.expanded) {
      currentLayout = vaporboyExpandedLayout;
    }

    return (
      <div>
        <ConfirmationModal />
        <ControlPanel />
        {currentLayout}
        <Touchpad />
      </div>
    );
  }
}
