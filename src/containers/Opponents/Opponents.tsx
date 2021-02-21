import { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { 
    Finance, 
    OpponentInformation, 
    opponentInformation, 
    Player, 
    Stock, 
    stockConstant, 
    Stocks, 
    StockSupply
} from 'nardis-game';

import CFinance from '../Finance/Finance';
import NardisState from '../../common/state';
import Opponent from './Opponent/Opponent';
import Button from '../../components/Utility/Button/Button';
import StockChart from './StockInfo/StockChart/StockChart';
import Styles from './Opponents.module.css';
import { IdFunc, MapDispatch, OnDispatch, Props } from '../../common/props';
import { ButtonType } from '../../common/constants';
import { NardisAction } from '../../common/actions';


interface OpponentsState {
    viewFinancePlayerId: string,
    showStockChart: boolean

};

interface DispatchedProps {
    buyStock: IdFunc,
    selStock: IdFunc
};

interface MappedOpponentsProps {
    players: Player[],
    gameStocks: Stocks[],
    turn: number
};

interface OpponentsProps extends Props, MappedOpponentsProps, DispatchedProps {};


export const getPlayerIndexFromPlayerId = (playerId: string, players: Player[]): number => {
    for (let i: number = 0; i < players.length; i++) {
        if (players[i].id === playerId) {
            return i;
        }
    }
    return -1;
}

const getStockOwnerBackgroundColorArray = (stock: Stock, players: Player[], defaultColor: string = 'white'): string[] => {
    const result: string[] = [];
    const supply: StockSupply = stock.getSupply();
    Object.keys(supply).forEach((playerId: string): void => {
        const n: number = supply[playerId];
        if (n > 0) {
            const index: number = getPlayerIndexFromPlayerId(playerId, players);
            if (index > -1) {
                const color: string = opponentInformation[index].color;
                for (let i: number = 0; i < n; i++) {
                    result.push(color);
                }
            }
        }
    });
    if (result.length < stockConstant.maxStockAmount) {
        const diff: number = stockConstant.maxStockAmount - result.length;
        for (let i: number = 0; i < diff; i++) {
            result.push(defaultColor);
        }
    }
    return result;
}

const mapStateToProps = (state: NardisState): MappedOpponentsProps => ({
    players: state.getAllPlayers(),
    gameStocks: state.getAllStock(),
    turn: state.turn
});

const mapDispatchToProps: MapDispatch<DispatchedProps> = (
    dispatch: OnDispatch
): DispatchedProps => (
    {
        buyStock: (playerId: string) => dispatch(
            {
                type: NardisAction.BUY_STOCK,
                payload: {
                    buyStock: {
                        playerId
                    }
                }
            }
        ),
        selStock: (playerId: string) => dispatch(
            {
                type: NardisAction.SELL_STOCK,
                payload: {
                    sellStock: {
                        playerId
                    }
                }
            }
        )
    }
);


/**
 * 
 */
class Opponents extends Component<OpponentsProps, OpponentsState> {

    state: OpponentsState = {
        viewFinancePlayerId: '',
        showStockChart: false
    };

    onViewFinanceClick: IdFunc = (playerId: string): void => {
        if (this.state.viewFinancePlayerId === playerId || playerId === '') {
            this.setState({viewFinancePlayerId: ''});
        } else {
            this.setState({viewFinancePlayerId: playerId});
        }
    }

    onStockBuy: IdFunc = (playerId: string): void => {
        this.props.buyStock(playerId);
    }

    onStockSell: IdFunc = (playerId: string): void => {
        this.props.selStock(playerId);
    }

    onBuyout: IdFunc = (playerId: string): void => {
        // TODO
        console.log('take over: ' + playerId);
    }

    onToggleStockChart = (): void => {
        this.setState({
            ...this.state,
            showStockChart: !this.state.showStockChart
        });
    }

    getFinance = (): JSX.Element => {
        const player: Player[] = this.props.players.filter(
            (player: Player): boolean => player.id === this.state.viewFinancePlayerId
        );
        if (player.length > 0) {
            const finance: Finance = player[0].getFinance();
            return (    
                <Fragment>
                    <hr/>
                    <CFinance 
                        alt={{
                            history: finance.getHistory(),
                            total: finance.getTotalHistory(),
                            totalProfits: finance.getTotalProfits()
                        }}
                    />
                     <hr/>
                </Fragment>
            );
        }
        return <div></div>;
    }

    render(): JSX.Element {
        const human: Player = this.props.players[0];
        return (
            <Fragment>
                <Button
                    disabled={false}
                    buttonType={ButtonType.StandardView}
                    whenClicked={() => this.onToggleStockChart()}
                    style={this.state.showStockChart ? {backgroundColor: 'green', marginBottom: '15px'} : {marginBottom: '15px'}}
                >
                    VIEW STOCK CHART
                </Button>
                {this.state.showStockChart ? <StockChart 
                    players={this.props.players} 
                    gameStocks={this.props.gameStocks[0]} 
                    turn={this.props.turn}
                /> : null}
                <hr/>
                <div className={Styles.Opponents}>
                     {this.props.players.map((player: Player, index: number): JSX.Element => {
                         const finance: Finance             = player.getFinance();
                         const stock  : Stock               = this.props.gameStocks[0][player.id];
                         const info   : OpponentInformation = opponentInformation[index];
                         let buyValue : number              = stock.getBuyValue();
                         let buyText  : string              = 'BUY STOCK';
                         let buyFunc  : IdFunc              = this.onStockBuy;
                         if (stock.currentAmountOfStockHolders() >= stockConstant.maxStockAmount) {
                             const supply = stock.getBuyOutValues();
                             for (let i: number = 0; i < supply.length; i++) {
                                 if (supply[i].id === human.id) {
                                     buyValue = stock.owningPlayerId === human.id ? buyValue : Math.floor(stock.getSellValue() * stockConstant.maxStockAmount) - supply[i].totalValue;
                                     buyText = stock.owningPlayerId === human.id ? buyText : 'BUY OUT';
                                     buyFunc = stock.owningPlayerId === human.id ? buyFunc : this.onBuyout;
                                     break;
                                 }
                             }
                         }
                         return (
                             <Opponent 
                                key={player.id}
                                upper={{
                                    name: player.name,
                                    level: player.getLevel().toLocaleString(),
                                    money: finance.getGold().toLocaleString() + 'G'
                                }}
                                lower={{
                                    netWorth: finance.getNetWorth().toLocaleString() + 'G',
                                    averageRevenue: finance.getAverageRevenue().toLocaleString() + 'G/TURN',
                                    averageExpense: finance.getAverageExpense().toLocaleString() + 'G/TURN',
                                    routes: player.getRoutes().length.toLocaleString(),
                                }}
                                callbacks={{
                                    viewFinances: this.onViewFinanceClick.bind(this, player.id),
                                    stockBuy: buyFunc.bind(this, player.id),
                                    stockSell: this.onStockSell.bind(this, player.id)
                                }}
                                stockBuy={buyValue.toLocaleString() + 'G'}
                                stockSell={stock.getSellValue().toLocaleString() + 'G'}
                                buyText={buyText}
                                stockOwners={getStockOwnerBackgroundColorArray(stock, this.props.players)}
                                financeActive={player.id === this.state.viewFinancePlayerId}
                                disabled={{
                                    stockBuy: (
                                        buyValue > human.getFinance().getGold() || 
                                        buyValue <= 0 || !stock.isActive() || 
                                        (stock.currentAmountOfStockHolders() >= stockConstant.maxStockAmount && stock.owningPlayerId === human.id)
                                    ),
                                    stockSell: !stock.isStockHolder(human.id) || !stock.isActive()
                                }}
                                isActive={player.isActive()}
                                avatar={info.avatar}
                                color={info.color}
                             />
                         )
                     })}
                </div>
                {this.state.viewFinancePlayerId ? this.getFinance() : null}
            </Fragment>
        );
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Opponents);