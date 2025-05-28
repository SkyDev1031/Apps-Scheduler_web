import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { SponsorLogApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error } from "../../utils";

const SponsorLogs = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await SponsorLogApi();
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
            <Column key={'created_at'} header={'Date'} field={'created_at'} sortable
                body={rowData => moment(rowData.created_at).format('lll')}
            />
            <Column key={'User'} header={'User'} field={'user'} sortable />
            <Column key={'Crypto'} header={'Crypto'} field={'cryptoid'} sortable
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
            <Column key={'amount'} field={'amount'} header={'amount'} sortable
                body={rowData => rowData.amount > 0 ? <NumberView value={rowData.amount} decimal={6} /> : '-'}
            />
            <Column key={'type'} field={'type'} header={'Type'}
                body={(rowData) => {
                    return (
                        <div className='info-text'>
                            {
                                rowData.type == 'D' ? 'Deposit' :
                                    rowData.type == 'W' ? 'Withdarw' :
                                        rowData.type == 'T' ? 'Transfer' :
                                            rowData.type == 'S' ? 'Swap' :
                                                'Unknow'
                            }</div>
                    )
                }} />
        </DataTable>
    )
};

export default SponsorLogs;