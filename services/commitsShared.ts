export type Commit = {
  id: string;
  sport: 'Football' | 'Basketball';
  list: 'recent' | 'top';
  rank?: number;
  name: string;
  position?: string;
  stars?: number;
  university?: string;
  commitDate?: string;
  source?: string;
  logo?: string;
  classYear?: string;
  hometown?: string;
  highSchool?: string;
};

export function filterCommits(commits: Commit[], filters: { position?: string; university?: string }) {
  return commits.filter((commit) => {
    const posMatch = filters.position ? (commit.position || '').toLowerCase().includes(filters.position.toLowerCase()) : true;
    const uniMatch = filters.university ? (commit.university || '').toLowerCase().includes(filters.university.toLowerCase()) : true;
    return posMatch && uniMatch;
  });
}
