import Encoding from 'encoding-japanese'

const DataTableRaw = (props) =>
{
	const encode = (value) =>
	{
		return Encoding.convert(value, {to: 'UNICODE', from: props.encoding})
	}
	
	return (
		<table className="widefat">
			<thead>
				<tr>
				{props.data[0] &&
					props.data[0].map((item, key) =>
					{
							return <th>{key}</th>
					})
				}
				</tr>
			</thead>
			<tbody>
			{
				props.data.map((item, i) =>
				{
					return <tr>
					{
						props.data[i].map((item) =>
						{
							return <td>{encode(item)}</td>;
						})
					}
					</tr>
				})
			}
			</tbody>
		</table>
	);
}
export default DataTableRaw;
