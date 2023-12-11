# import all modules
import js
import pandas as pd
from deseqpyodide.dds import DeseqDataSet   #from pydeseq2.dds import DeseqDataSet
from deseqpyodide.ds import DeseqStats  #from pydeseq2.ds import DeseqStats

# set up counts table
counts = pd.read_csv('count_table.csv')
counts = counts[counts.sum(axis = 1) > 0].set_index('Geneid').transpose()

# divide into cohorts
metadata = pd.DataFrame(zip(counts.index, ['C','C','C','C', 'RS', 'RS', 'RS', 'RS']), columns = ['Sample', 'Condition'])
metadata = metadata.set_index('Sample')


# run dispersion and log fold-change (LFC) estimation.
dds = DeseqDataSet(counts=counts, metadata=metadata, design_factors="Condition")
dds.deseq2()

# summary of statistical tests
stat_res = DeseqStats(dds, n_cpus=8, contrast = ('Condition','RS','C'))
stat_res.summary()
res = stat_res.results_df

# analysis result
print(res)
