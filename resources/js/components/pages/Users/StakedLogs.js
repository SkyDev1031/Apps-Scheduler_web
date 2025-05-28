import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { stakedLogApi } from '../../api/OriginAPI.js';
import { Image } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error } from "../../utils";

const StakedLogs = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await stakedLogApi();
            setData(res.logs)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])

    return (
        <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
            resizableColumns columnResizeMode="fit" showGridlines
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
            filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
            header={() => (
                <div className="justify-content-end d-flex">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                    </span>
                </div>
            )}
        >
            <Column key={'Date'} header={'Date'} field={'TransDate'} sortable
                body={rowData => moment(rowData.TransDate).format('lll')}
            />
            <Column key={'Coin'} header={'Coin'} field={'wallet'} sortable
                body={
                    (rowData => (
                        rowData.wallet ?
                            <div className='crypto-cell'>
                                <Image src={crypto_path(rowData.wallet.Image)} />
                                <span className='warning-text'>{rowData.wallet.CryptoName}</span>
                            </div>
                            :
                            <span>Deleted!</span>
                    ))
                } />
            <Column key={'StakeAmount'} field={'StakeAmount'} header={'Staked Amount'} sortable className='warning-text' />
            <Column key={'NetworkEligibile'} field={'NetworkEligibile'} header={'Network Eligibile'} sortable />
            <Column key={'Status'} field={'Status'} header={'Status'} sortable />
        </DataTable>
    )
};

export default StakedLogs;