import React from 'react';
import ReactDOM from 'react-dom';
import { useState } from 'react'

import Encoding from 'encoding-japanese'


const RawData = (props) =>
{
	console.log(Encoding);
	return (<table className="widefat striped">
		{
		<thead>
			<tr>
				<th>操作</th>
				{props.data[0] && props.data[0].map((item, i) => {
					return <th>{i}</th>;
				})}
				<th>結果</th>
			</tr>
		</thead>
		}
		<tbody>
		{props.data && props.data.map((item) => {
			return (<tr>
				<td><input type="checkbox" checked={item.check} onClick={(e) => props.handleCheck(e, props.indexRef)}/></td>
				{
					item.map((cell) => {
						return <td>{props.encode(cell)}</td>
					})
				}
				<td className="result">
					結果を表示
				</td>
			</tr>)
		})}
		</tbody>

	</table>);
}

export default RawData;
