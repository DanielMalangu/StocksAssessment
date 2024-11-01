import React, { useCallback, useEffect, useState } from 'react';
import Chart, {
    Series,
    Aggregation,
    ArgumentAxis,
    Grid,
    Label,
    ValueAxis,
    Margin,
    Legend,
    Tooltip,
    ZoomAndPan,
} from 'devextreme-react/chart';
import RangeSelector, {
    Size,
    Scale,
    Chart as RsChart,
    ValueAxis as RsValueAxis,
    Series as RsSeries,
    Aggregation as RsAggregation,
    Behavior,
    RangeSelectorTypes,
} from 'devextreme-react/range-selector';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CircularProgress } from '@mui/material';




function App() {

    const [data, setData] = useState([""]);
    const [company, setCompany] = useState("AMZN");
    const [loading, setLoading] = useState(false);
    const [visualRange, setVisualRange] = useState({});



    useEffect(() => {

        fetchFinancialData();
    }, []);

    const handleChange = (event: SelectChangeEvent) => {
            
        setCompany(event.target.value as string);
        fetchFinancialData();
    };

    const updateVisualRange = useCallback((e: RangeSelectorTypes.ValueChangedEvent) => {
        setVisualRange(e.value);
    }, [setVisualRange]);

    async function login() {
        debugger
        const response = await fetch(import.meta.env.VITE_AUTH_API + '/login', {
            method: 'POST',
            body: JSON.stringify({
                email: import.meta.env.VITE_EMAIL,
                password: import.meta.env.VITE_PASSWORD,

            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        })
        const responseData = await response.json();
        debugger
        sessionStorage.setItem("token", responseData.accessToken);
    }
    async function fetchFinancialData() {
        setLoading(true);
       // await login();
        const response = await fetch(import.meta.env.VITE_PRICE_API +'?' + new URLSearchParams({
            symbol: company
        })
/*        , {
            headers: {
                'Authorization': sessionStorage.getItem("token"),
            }
        }
*/        );
        const responseData = await response.json();
        debugger
            const processedData = [];

        let dates = Object.keys(responseData['Time Series (Daily)']);
        let timeSeries = Object.values(responseData['Time Series (Daily)']);

        for (let i = 0; i < timeSeries.length; i++)
        {
            timeSeries[i].date = dates[i]
            processedData.push(timeSeries[i]);
        }

        setData(processedData);
        setLoading(false);
    }

    return (
        <>
            <FormControl fullWidth>
                <InputLabel id="company-select-label">Company</InputLabel>
                <Select
                    labelId="company-select-label"
                    id="company-select"
                    value={company}
                    label="Company"
                    onChange={handleChange}
                >
                    <MenuItem value={"AMZN"}>AMZN</MenuItem>
                    <MenuItem value={"AAPL"}>AAPL</MenuItem>
                    <MenuItem value={"FB"}>FB</MenuItem>
                    <MenuItem value={"MSFT"}>MSFT</MenuItem>
                    <MenuItem value={"NFLX"}>NFLX</MenuItem>
                </Select>
            </FormControl>
            {loading ?
                (
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center"
                        } }
                    >
                        <CircularProgress /> 
                    </Box>
                ):

                (
                    <div id = "chart-test">
                    <Chart
                        id = "zoomedChart"
                        dataSource = { data }
                        title = {company + " Stock Prices"}
                    >
                        <ZoomAndPan
                            argumentAxis="both"
                            valueAxis="both"
                        />
                        <Series
                            type="candlestick"
                            openValueField="1. open"
                            highValueField="2. high"
                            lowValueField="3. low"
                            closeValueField="4. close"
                            argumentField="date"
                        >
                            <Aggregation enabled={true} />
                        </Series>
                        <ArgumentAxis
                            visualRange={visualRange}
                            valueMarginsEnabled={false}
                            argumentType="datetime"
                        >
                            <Grid visible={true} />
                            <Label visible={false} />
                        </ArgumentAxis>
                        <ValueAxis valueType="numeric" />
                        <Margin right={10} />
                        <Legend visible={false} />
                        <Tooltip enabled={true} />
                    </Chart >
                    <RangeSelector
                        dataSource={data}
                        onValueChanged={updateVisualRange}
                    >
                        <Size height={120} />
                        <RsChart Title={"Volume"}>
                            <RsValueAxis valueType="numeric" />
                            <RsSeries
                                type="bar"
                                valueField="5. volume"
                                argumentField="date"
                            >
                                <RsAggregation enabled={true} />
                            </RsSeries>
                        </RsChart>
                        <Scale
                            placeholderHeight={20}
                            minorTickInterval="day"
                            tickInterval="month"
                            valueType="datetime"
                            aggregationInterval="week"
                        />
                        <Behavior
                            snapToTicks={false}
                            valueChangeMode="onHandleMove"
                        />
                    </RangeSelector>
                    </div >
                )
            }

        </>

    );
}

export default App;
