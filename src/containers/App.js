import React, { Component } from 'react';
import { AppHeader } from '../components/AppHeader';
import { Theme } from '../Theme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { SearchResults } from '../components/SearchResults';
import SearchFormContainer from './SearchFormContainer';
import { isArrayEmpty, isObjectEmpty } from '../shared/util';
import { filterEconomyFlights } from '../shared/flightSearch';
import { updateFlightsWithPrices } from '../shared/flightSearch';
import { StrataFullScreenDialog } from '../components/Common/StrataFullScreenDialog';
import { ReviewSelection } from '../components/ReviewSelection';
import { trip } from '../shared/app-constants';
import { Empty } from '../components/Empty';
import { Desktop } from '../components/Desktop';

const appScreens = {
  showSearch: false,
  showReview: false
};
const makeActive = screen => Object.assign({}, appScreens, { [screen]: true });

const defaultState = {
  from: '',
  to: '',
  departFlights: {},
  returnFlights: {},
  totalTravellers: 1,
  isRoundTrip: true,
  selectedDepartFlight: {},
  selectedReturnFlight: {},
  controlFlow: makeActive('showSearch')
};

class App extends Component {
  state = defaultState;

  onSearch = (results, isRoundTrip, totalTravellers) => {
    const from = !isArrayEmpty(results) ? results[0].from : '';
    const to = !isArrayEmpty(results) ? results[0].to : '';
    const economyDepartFlights = filterEconomyFlights(results[0] || {});
    const economyReturnFlights = filterEconomyFlights(results[1] || {});
    const departFlights = updateFlightsWithPrices(economyDepartFlights || {}, totalTravellers);
    const returnFlights = updateFlightsWithPrices(economyReturnFlights || {}, totalTravellers);
    this.setState({ from, to, isRoundTrip, totalTravellers, departFlights, returnFlights });
  };

  onSelectDepartFlight = flight => {
    this.setState({ selectedDepartFlight: flight, controlFlow: makeActive('showReview') });
  };

  backToSearch = () =>
    this.setState({ controlFlow: makeActive('showSearch'), selectedDepartFlight: {}, selectedReturnFlight: {} });

  render() {
    if (window.screen.width >= 1024 && window.screen.height >= 768) return <Desktop />;
    const {
      from,
      to,
      departFlights,
      selectedDepartFlight,
      selectedReturnFlight,
      totalTravellers,
      isRoundTrip
    } = this.state;

    const { showReview } = this.state.controlFlow;
    const showEmpty = isObjectEmpty(departFlights);
    const totalPrice = selectedDepartFlight.price;

    return (
      <MuiThemeProvider theme={Theme}>
        <>
          <AppHeader />
          <SearchFormContainer onSearch={this.onSearch} />
          {showEmpty && <Empty />}
          {!showEmpty && <SearchResults flights={departFlights} onSelect={this.onSelectDepartFlight} />}
        </>

        <StrataFullScreenDialog open={showReview} onBack={this.backToSearch} label={'Review'}>
          <ReviewSelection
            from={from}
            to={to}
            departFlight={selectedDepartFlight}
            returnFlight={selectedReturnFlight}
            tripType={isRoundTrip ? trip.roundTrip : trip.oneWay}
            traveller={totalTravellers + ' Traveller'}
            totalPrice={totalPrice}
            onClose={this.backToSearch}
            onBook={() => console.log('Clicked BOOK')}
          />
        </StrataFullScreenDialog>
      </MuiThemeProvider>
    );
  }
}
export default App;
