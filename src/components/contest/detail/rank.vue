<template>
	<v-container fiuld>
		<v-data-table
			:items = "renderingRankingList"
			:loading = "isLoading > 0"
			:headers-length = "4 + problemLength"
			hide-actions
		>
			<v-progress-linear
				slot = "progress"
				height = "2"
				color = "grey"
				indeterminate
			/>
			<template slot = "headers">
				<tr
					justify-center
					align-center

				>
					<th
						role = "columnheader"
						scope = "col"
						class = "column text-xs-center"
						style = "width: 10%"
					>
						#
					</th>
					<th
						role = "columnheader"
						scope = "col"
						class = "column text-xs-center"
						style = "width: 20%"
					>
						Team
					</th>
					<th
						role = "columnheader"
						scope = "col"
						class = "column text-xs-center"
						style = "width: 10%"
					>
						Solved
					</th>
					<th
						role = "columnheader"
						scope = "col"
						class = "column text-xs-center"
						style = "width: 10%"
					>
						Penalty
					</th>
					<th
						v-for = "(each , index) in problemLength"
						:key = "index"
						:style = "{ width: 50 / problemLength + '%' }"
						role = "columnheader"
						scope = "col"
						class = "column text-xs-center"
					>
						<router-link
							:to = "{name: 'ContestSpecifyProblem',
								params: {id: String.fromCharCode( 65 + index ) }}">
							{{ String.fromCharCode( 65 + index ) }}
						</router-link>
					</th>
				</tr>
			</template>
			<template
				slot = "items"
				slot-scope = "{ item , index }">
				<tr tile>
					<td class = "text-xs-center nowrap">
						{{ index + 1 }}
					</td>
					<td class = "text-xs-center">
						{{ item.name }}
					</td>
					<td class = "text-xs-center">
						{{ item.solved }}
					</td>
					<td class = "text-xs-center">
						{{ item.penalty }}
					</td>
					<td
						v-for = "(each , index) in problemLength"
						:key = "index"
						:class = "{ 'first-blood' : item.details[index].firstBlood}"
						class = "text-xs-center"
					>
						<v-icon
							v-if = "item.details[index].firstBlood"
							small
							color = "success"
							class = "mr-1"
						>
							mdi-thumb-up-outline
						</v-icon>
						<strong
							v-if = "item.details[index].tried > 0 && !item.details[index].solved"
							class = "error--text"
						>-{{ item.details[index].tried }}</strong>
						<strong
							v-if = "item.details[index].solved"
							class = "success--text"
						>
							<span
								v-if = "item.details[index].tried > 1 || !item.details[index].firstBlood">+</span>
							<span
								v-if = "item.details[index].tried > 1">{{ item.details[index].tried - 1 }}</span>
						</strong>
					</td>
				</tr>
			</template>
		</v-data-table>
	</v-container>
</template>

<script>

import gql from 'graphql-tag';
import Verdict from '@/modules/verdict/main';
import { getMinutesBetweenTwo } from '../utils';

export default {
	props: {
		contest: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			isLoading: 0,
			renderingRankingList: [],
			problemLength: 0,
		};
	},

	mounted() {
		this.fetchData();
	},

	methods: {
		init() {
			this.fetchData();
		},

		fetchData() {
			const query = gql`
				query ContestRankingList( $pk: ID!){
					contestRankingList(pk: $pk)
				}
			`;
			this.isLoading += 1;
			this.$apollo.query({
				query,
				variables: {
					pk: this.contest.pk,
				},
				fetchPolicy: 'no-cache',
			})
				.then(response => JSON.parse(response.data.contestRankingList))
				.then((data) => {
					this.updateRenderingList(data);
				})
				.finally(() => {
					this.isLoading -= 1;
				});
		},

		updateRenderingList(submissions) {
			if (!submissions) {
				return;
			}
			const problemIdToIdx = new Map();
			const minimumSolvedTime = new Map();
			for (let i = 0; i < this.contest.problems.length; i += 1) {
				problemIdToIdx.set(Number(this.contest.problems[i].pk), i);
				minimumSolvedTime.set(i, Infinity);
			}
			const arr = [];
			const teamnameToPos = new Map();
			const { startTime } = this.contest.settings;
			submissions.forEach((each) => {
				const {
					status, team, createTime, teamApproved,
				} = each;
				const idx = problemIdToIdx.get(each.problemId);
				// Avoid the delete problem
				if (idx !== undefined && teamApproved) {
					let teamIndex = null;
					if (teamnameToPos.get(team) === undefined) {
						teamnameToPos.set(team, arr.length);
						teamIndex = arr.length;
						const detailArr = [];
						for (let i = 0; i < this.contest.problems.length; i += 1) {
							detailArr.push({
								solved: false,
								tried: 0,
								firstBlood: false,
								solvedTime: null,
							});
						}
						arr.push({
							name: team,
							solved: 0,
							penalty: 0,
							details: detailArr,
						});
					} else {
						teamIndex = teamnameToPos.get(team);
					}
					const teamRef = arr[teamIndex];
					const isSolved = teamRef.details[idx].solved;
					if (!isSolved) {
						const st = Verdict.valueOf(status);
						if (st !== Verdict.ce
						&& st !== Verdict.rn && st !== Verdict.pd && st !== Verdict.pr && st !== Verdict.je) {
							if (st === Verdict.ac) {
								teamRef.penalty += getMinutesBetweenTwo(startTime, createTime);
								teamRef.penalty += 20 * teamRef.details[idx].tried;
								teamRef.solved += 1;
								teamRef.details[idx].solved = true;
								const timing = this.$moment.unix(new Date(createTime)).unix();
								teamRef.details[idx].solvedTime = timing;
								minimumSolvedTime.set(
									idx, Math.min(minimumSolvedTime.get(idx), timing),
								);
							}
							teamRef.details[idx].tried += 1;
						}
					}
				}
			});
			arr.forEach((each) => {
				for (let i = 0; i < each.details.length; i += 1) {
					const status = each.details[i];
					if (status.solved && status.solvedTime === minimumSolvedTime.get(i)) {
						status.firstBlood = true;
					}
				}
			});
			arr.sort((a, b) => {
				if (a.solved > b.solved || (a.solved === b.solved && a.penalty < b.penalty)) { return -1; }
				if (a.solved === b.solved && a.penalty === b.penalty) { return 0; }
				return 1;
			});
			this.problemLength = this.contest.problems.length;
			this.renderingRankingList = arr;
		},
	},
};
</script>
