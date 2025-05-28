import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { swapLogApi } from '../../api/OriginAPI.js';
import { Image } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error } from "../../utils";

const SwapLogs = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await swapLogApi();
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
            <Column key={'Date'} header={'Date'} field={'DateOfSwap'} sortable
                body={rowData => moment(rowData.DateOfSwap).format('lll')}
            />
            <Column key={'swap_from'} header={'Swap From'} field={'wallet'} sortable
                body={rowData => (
                    rowData.wallet ?
                        <div className='crypto-cell'>
                            <Image src={crypto_path(rowData.wallet.Image)} />
                            <span className='warning-text'>{rowData.wallet.CryptoName}</span>
                        </div>
                        :
                        <span>Deleted!</span>
                )} />
            <Column key={'SwapAmount'} field={'SwapAmount'} header={'Swap Amount'} sortable className='warning-text' />
            <Column key={'swao_to_crypto'} header={'Swap To Crypto'} field={'walletForFees'} sortable
                body={rowData => (
                    rowData.walletForFees ?
                        <div className='crypto-cell'>
                            <Image src={crypto_path(rowData.walletForFees.Image)} />
                            <span className='warning-text'>{rowData.SwapAmountInCrypto} {rowData.walletForFees.CryptoName}</span>
                        </div>
                        :
                        <span>Deleted!</span>
                )} />
            <Column key={'FeesInCrypto'} field={'FeesInCrypto'} header={'Swap Fees'} sortable className='warning-text'
                body={rowData => (`${rowData.FeesInCrypto} ${rowData.wallet?.CryptoName || ''}`)} />
        </DataTable>
    )
};

export default SwapLogs;