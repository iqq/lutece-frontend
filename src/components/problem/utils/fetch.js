import Apollo from '@/plugins/essential/apollo-provider';


const fetchProblemData = ({ slug, gql }) => new Promise((resolve, reject) => {
	Apollo.defaultClient.query({
		query: gql,
		variables: {
			slug,
		},
	})
		.then(response => resolve(response))
		.catch(error => reject(error));
});


export default fetchProblemData;
