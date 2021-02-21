import "./App.css";
import { useEffect, useState } from "react";
import { Slider } from "@material-ui/core";
import Graph from "./Graph";

function App() {

  const [countries, setCountries] = useState();
  const [selectedCountry, setSelectedCountry] = useState("USA");
  const [startYear, setStartYear] = useState("1980");
  const [endYear, setEndYear] = useState("2012");
  const [GDP, setGDP] = useState([]);
  const [climateData, setclimateData] = useState([]);

  useEffect(() => {
    fetch("https://api.worldbank.org/v2/country?format=json&per_page=500")
      .then(response => response.json())
      .then(data => {
        setCountries(data[1]);
      });
  }, []);

  useEffect(() => {
    if(selectedCountry) {
      fetch("https://api.worldbank.org/v2/country/" + selectedCountry + "/indicator/NY.GDP.MKTP.CD?format=json")
        .then(response => response.json())
        .then(data => {
          setGDP(data[1]);
        });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if(selectedCountry) {
      fetch("http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/tas/year/" + selectedCountry + ".json")
        .then(response => response.json())
        .then(data => {
          setclimateData(data);
        });
    }
  }, [selectedCountry]);

  const getYearRange = (data) => {
    const allYears = data.map(({date}) => Number.parseInt(date));
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);
    return [minYear, maxYear];
  };

  const handleSliderChange = (event, newValue) => {
    setStartYear(newValue[0]);
    setEndYear(newValue[1]);
  };

  return (
    <div className="app">
      <h1>Climate and GDP Trends</h1>
      <p>Average temperature and GDP trends over time.</p>
      <label>
        <p className="screenreader">Select Country</p>
        <select onChange={(event) => {setSelectedCountry(event.target.value);}} value={selectedCountry}>
          {countries?.length
            ? countries.map(({id, name}) => <option key={id} value={id} >{name}</option>)
            : <option disabled>Loading&hellip;</option>
          }
        </select>
      </label>

      {GDP && climateData
        ? <>
          <Graph width={600} height={300} GDP={GDP} climateData={climateData} yearRange={[startYear, endYear]} />
          <div className="slider">
            <Slider value={[startYear, endYear]} onChange={handleSliderChange} min={getYearRange(GDP)[0]} max={getYearRange(GDP)[1]} />
          </div>
        </>
        : <p className="loading">Loading&hellip;</p>
      }
    </div>
  );
}

export default App;
