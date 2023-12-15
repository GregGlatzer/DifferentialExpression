import pandas as pd
from time import time
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats

def preprocess_for_deseq2(counts_fp: str, cohort_A_fp: str, cohort_B_fp: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Preprocesses the counts matrix for use with DESeq2. Returns a tuple of the preprocessed counts matrix and the cohort data.
    """

    start_time = time()

    # Load dataset
    print("Loading dataset")
    counts = pd.read_csv(counts_fp, index_col=0)
    print(f"Dataset loaded in {round(time() - start_time, 2)} seconds")
    print("Dataset size:", counts.shape)

    # Filter out all-0 genes
    counts = counts.loc[:, counts.sum() != 0]

    # Read cohort data
    cohort_A = pd.read_csv(cohort_A_fp)
    cohort_B = pd.read_csv(cohort_B_fp)

    def determine_cohort(sample_id):
        if sample_id.lower() in cohort_A['COHORT A'].str.lower().values:
            return 'A'
        elif sample_id.lower() in cohort_B['COHORT B'].str.lower().values:
            return 'B'
        else:
            return 'Unknown'

    # Apply determine_cohort function to create 'cohort' column
    sids = counts.columns
    cohorts = [determine_cohort(sample_id) for sample_id in sids]

    # Print cohort sizes
    print('Cohort A size:', cohorts.count('A'))
    print('Cohort B size:', cohorts.count('B'))
    print('No Cohort size:', cohorts.count('Unknown'))

    # Drop Unknown cohort
    cohort_data = pd.DataFrame({'Sample': sids, 'Condition': cohorts})
    cohort_data = cohort_data[cohort_data['Condition'] != 'Unknown']

    # Set index to sample ID
    cohort_data = cohort_data.set_index('Sample')

    # Subset the counts to only include the columns that are in the cohorts
    counts_matrix = counts[cohort_data.index]
    print('Transposing data for deseq consumption')

    # NOTE: This transpose is not needed in the R version, because the R deseq expects the counts matrix to be in the format of genes as rows and samples as columns. 
    counts_matrix = counts_matrix.transpose()
    

    # Make sure rownames and colnames match
    print('Validating preprocessed data. Valid = ', all(counts_matrix.index == cohort_data.index))

    return counts_matrix, cohort_data


def deseq(counts_matrix: pd.DataFrame, metadata: pd.DataFrame) -> pd.DataFrame:

    print('Running Deseq')
    # run dispersion and log fold-change (LFC) estimation.
    dds = DeseqDataSet(counts=counts_matrix, metadata=metadata, design_factors="Condition")
    dds.deseq2()

    print('Running stat summary')
    # summary of statistical tests
    stat_res = DeseqStats(dds, n_cpus=8, contrast = ('Condition','A','B'))
    stat_res.summary()
    res = stat_res.results_df

    return res
    
start_time = time()

counts_matrix, cohort_data = preprocess_for_deseq2(
    counts_fp="./big_int.csv",
    cohort_A_fp="C:/Users/gglatzer/OneDrive - Fred Hutchinson Cancer Center/Documents/Oncoscape/Cohort_A.csv",
    cohort_B_fp="C:/Users/gglatzer/OneDrive - Fred Hutchinson Cancer Center/Documents/Oncoscape/Cohort_B.csv"
)

# counts_matrix, cohort_data = preprocess_for_deseq2(
#     counts_fp=r"C:\Users\gglatzer\GitHub\DifferentialExpression\count_table.csv",
#     cohort_A_fp=r"C:\Users\gglatzer\GitHub\DifferentialExpression\cha.csv",
#     cohort_B_fp=r"C:\Users\gglatzer\GitHub\DifferentialExpression\chb.csv"
# )

print('[PREPROCESSING FINISHED]. Runtime (s):', time() - start_time)

start_time_deseq = time()

deseq_summary = deseq(counts_matrix, cohort_data)

print('[DESEQ FINISHED]. Runtime (s):', time() - start_time_deseq)
print(deseq_summary)

print('[TOTAL RUNTIME (s)]:', time() - start_time)
