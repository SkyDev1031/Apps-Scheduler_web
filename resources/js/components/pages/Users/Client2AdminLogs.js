import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { c2aTransferLogApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error, toast_success } from "../../utils";

const Client2AdminLogs = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        setLoading(true);
        const res = await c2aTransferLogApi().catch(e => toast_error(e, _ERROR_CODES.NETWORK_ERROR));
        if (res) {
            if (res.message) toast_success(res.message);
            setData(res.logs)
        }
        setLoading(false);
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
            <Column key={'Date'} header={'Date'} field={'DateOfTransfer'} sortable
                body={rowData => moment(rowData.DateOfTransfer).format('lll')}
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

            <Column key={'Amount'} field={'Amount'} header={'Amount'} sortable
                body={rowData => <NumberView value={rowData.Amount} />}
            />
            <Column key={'AmountType'} field={'AmountType'} header={'Transfer Type'} sortable
                body={rowData => <div className='info-text'><b>{rowData.AmountType == 'H' ? 'Hold' : 'Regular'}</b></div>}
            />
        </DataTable>
    )
};

export default Client2AdminLogs;