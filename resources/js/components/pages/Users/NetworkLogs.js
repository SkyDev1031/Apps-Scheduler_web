import moment from 'moment';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { networkLogApi, payoutPercentApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error } from "../../utils";

const NetworkLogs = () => {
    const [payoutPercent, setPayoutPercent] = useState(20);
    const [rankQuery, setRankQuery] = useState()
    const [networkQuery, setNetworkQuery] = useState()
    const [logsQuery, setLogsQuery] = useState()
    const [data, setData] = useState({})
    const { isAdmin, setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
        getRealPayoutPercent();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await networkLogApi();
            setData(res)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])
    const getRealPayoutPercent = useCallback(async () => {
        try {
            const res = await payoutPercentApi();
            if (res.success) {
                let payoutPercent = (parseFloat(res.payoutPercent)).toFixed(2);
                setPayoutPercent(payoutPercent);
            }
        } catch (error) {
            toast_error("Invalid Server Connection!", _ERROR_CODES.NETWORK_ERROR);
        }
    }, []);

    return (
        <>
            {!isAdmin && <div className='d-flex'>
                <span className='myranking'>{`MY RANK IS ${data.rank || 0}, LEFT LEG ${data.total_left || 0}, RIGHT LEG ${data.total_right || 0}, DIRECT REFERRALS ${data.direct_referrals || 0}`}</span>
                <h6 className='ml-10px my-auto'>{" Average Payout % "}&nbsp;&nbsp;</h6>
                <input className="my-auto p-0 width-100px text-center" value={payoutPercent} disabled={true} />
            </div>
            }
            <div className='row'>
                <div className='col-md-7'>
                    <DataTable value={data.network_settings} responsiveLayout="scroll" stripedRows paginator
                        resizableColumns columnResizeMode="fit" showGridlines
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                        filters={{ 'global': { value: rankQuery, matchMode: FilterMatchMode.CONTAINS } }}
                        header={() => (
                            <div className="justify-content-between d-flex">
                                <h4 className='table-title'>RANK CHART</h4>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={rankQuery} onChange={e => setRankQuery(e.target.value)} placeholder="Search by keyword" />
                                </span>
                            </div>
                        )}
                    >
                        <Column key={'Rank'} header={'Rank'} field={'Rank'} sortable style={{ color: '#8ec545' }} />
                        <Column key={'Subscription'} header={'L/R Packages Active'} field={'Subscription'} sortable />
                        <Column key={'Level1'} header={'Sponsor Level 1 (%)'} field={'Level1'} style={{ color: '#016cb0' }} sortable />
                        <Column key={'Level2'} header={'Sponsor Level 2 (%)'} field={'Level2'} style={{ color: '#016cb0' }} sortable />
                        <Column key={'Level3'} header={'Sponsor Level 3 (%)'} field={'Level3'} style={{ color: '#016cb0' }} sortable />
                        <Column key={'LevelBinary'} header={'Binary (%)'} field={'LevelBinary'} style={{ color: 'orange' }} sortable />
                    </DataTable>
                </div>
                <div className='col-md-5'>
                    <DataTable value={data.wallets} responsiveLayout="scroll" stripedRows paginator
                        resizableColumns columnResizeMode="fit" showGridlines
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                        filters={{ 'global': { value: networkQuery, matchMode: FilterMatchMode.CONTAINS } }}
                        header={() => (
                            <div className="justify-content-between d-flex">
                                <h4 className='table-title'>NETWORK</h4>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={networkQuery} onChange={e => setNetworkQuery(e.target.value)} placeholder="Search by keyword" />
                                </span>
                            </div>
                        )}
                    >
                        <Column key={'crypto'} header={'Crypto'} field={'CryptoName'} sortable
                            style={{ width: '60%' }}
                            body={(rowData => (
                                <div className='crypto-cell'>
                                    <Image src={crypto_path(rowData.Image)} />
                                    <span>{rowData.CryptoName}</span>
                                </div>
                            ))} />
                        <Column key={'LeftAmount'} field={'Left'} header={'LeftAmount'} sortable
                            style={{ width: '20%' }}
                            body={rowData => <NumberView value={rowData.LeftAmount} />}
                        />
                        <Column key={'RightAmount'} field={'Right'} header={'RightAmount'} sortable
                            style={{ width: '20%' }}
                            body={rowData => <NumberView value={rowData.RightAmount} />}
                        />
                    </DataTable>
                </div>
            </div>
            <br />
            <br />
            <DataTable value={data.data} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: logsQuery, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <h4 className='table-title'>NETWORK LOGS</h4>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={logsQuery} onChange={e => setLogsQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'DateOfTrans'} header={'Date'} field={'DateOfTrans'} sortable
                    body={(rowData) => (moment(rowData.DateOfTrans).format('lll'))} />
                <Column key={'rank'} header={'Rank'} field={'rank'} sortable
                    style={{ color: '#016cb0' }} />
                <Column key={'level'} header={'Level'} field={'level'} sortable
                    style={{ color: '#016cb0' }} />
                <Column key={'leg'} header={'Leg'} field={'leg'} sortable
                    style={{ color: '#016cb0' }} />
                <Column key={'wallet'} header={'Wallet'} field={'wallet'} sortable />
                <Column key={'payout_type'} header={'Payout Type'} field={'payout_type'} sortable
                    style={{ color: 'green' }} />
                <Column key={'id'} field={'id'} header={'Details'}
                    body={(rowData) => <>
                        <div dangerouslySetInnerHTML={{ __html: rowData.detail }} >
                        </div>
                    </>} />
            </DataTable>
        </>

    )
};

export default NetworkLogs;