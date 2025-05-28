import { Tooltip } from 'primereact';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useEffect, useState } from 'react';
import { getNetworkApi } from '../../api/OriginAPI.js';
import { useGlobalContext } from "../../contexts";
import { toast_error } from '../../utils';

export default function Network() {
    const [data, setData] = useState([])
    const { isAdmin, setLoading } = useGlobalContext();
    const [accordionIndex, setAccordionIndex] = useState(0)

    useEffect(() => {
        $(".tree").tree_structure({
            add_option: false,
            edit_option: false,
            delete_option: false,
            highlight_option: false,
            confirm_before_delete: false,
            animate_option: false,
            fullwidth_option: false,
            align_option: 'center',
            draggable_option: false
        });
    }, [data, accordionIndex])

    useEffect(() => {
        setLoading(true);
        getNetworkApi()
            .then(res => setData(res.data))
            .catch(err => toast_error(err))
            .finally(() => setLoading(false))
    }, [])


    const renderHeader = (item) => {
        if (!item || !(item.length > 0)) return <></>
        const node = item[0];
        const _data = { left: 0, right: 0, rank: 0, referrals: 0, sponsor: '', ...(node.data || {}) };
        return (
            <div>
                <strong>{node.label}</strong>
                <small>{` (Sponsor:${_data.sponsor} Left:${_data.left} Right:${_data.right} Rank: ${_data.rank} Direct Referrals:${_data.referrals})`}</small>
            </div>
        )
    }
    const renderTree = (data, deep) => (
        data.map(item => {
            const _data = { left: 0, right: 0, rank: 0, referrals: 0, sponsor: '', ...(item.data || {}) };
            return (
                <li key={item.key} className={`${item.leg?.toLowerCase()} ${deep >= 2 ? 'thide' : ''}`}>
                    <Tooltip target={`.tooltip-button-${item.key}`} position='top'>
                        <div className="flex align-items-center ">
                            <span style={{ minWidth: '8rem', color: 'white', fontSize: 15, lineHeight: "20px" }}>
                                {`Sponsor:${_data.sponsor}\nLeft:${_data.left} Right:${_data.right} Rank: ${_data.rank}\nDirect Referrals:${_data.referrals}`}
                            </span>
                        </div>
                    </Tooltip>
                    <div className={`network-item tooltip-button-${item.key}`}>
                        {item.label}
                    </div>
                    {item.children?.length > 0 && <ul>{renderTree(item.children, deep + 1)}</ul>}
                </li>
            )
        })
    )

    const renderNetworks = (treeData) => (
        <div className='overflow'>
            <ul className="tree">{renderTree(treeData, 0)}</ul>
        </div>
    )

    if (!(data?.length > 0)) return <></>

    return (
        <div className="network-container">
            {isAdmin ?
                <Accordion className="network-accordion"
                    activeIndex={accordionIndex}
                    onTabChange={(e) => {
                        setAccordionIndex(e.index)
                    }}>
                    {data.map((item, index) => (
                        <AccordionTab key={index} header={renderHeader(item)} >
                            {renderNetworks(item)}
                        </AccordionTab>
                    ))}
                </Accordion>
                :
                data.length > 0 && renderNetworks(data)
            }
        </div>
    )
}