library(data.table)
library(DESeq2)

# COUNTS_FP <- "C:/Users/gglatzer/Downloads/1298_combatseq_log2tpm_sampleIDnew.csv"
# COHORT_A_FP <- "C:/Users/gglatzer/OneDrive - Fred Hutchinson Cancer Center/Documents/Oncoscape/Cohort_A.csv"
# COHORT_B_FP <-"C:/Users/gglatzer/OneDrive - Fred Hutchinson Cancer Center/Documents/Oncoscape/Cohort_B.csv"


COUNTS_FP <- "C:/Users/gglatzer/GitHub/DifferentialExpression/count_table.csv"
COHORT_A_FP <- "C:/Users/gglatzer/GitHub/DifferentialExpression/cha.csv"
COHORT_B_FP <-"C:/Users/gglatzer/GitHub/DifferentialExpression/chb.csv"

printWithTimestamp <- function(message) {
  # Get current timestamp
  current_time <- Sys.time()
  
  # Format timestamp as a string
  timestamp <- format(current_time, "%Y-%m-%d %H:%M:%S")
  
  # Print message with timestamp
  cat(timestamp, ": ", message, "\n")
}

start_time <- Sys.time()

# Load dataset
printWithTimestamp("Loading dataset")
counts <- fread(COUNTS_FP)
setnames(counts, 'V1', 'GeneID')
printWithTimestamp(paste("Dataset loaded in", round(Sys.time() - start_time, 2), "seconds"))
printWithTimestamp(paste("Dataset size:", dim(counts)))

# Filter out all-0 genes
counts <- counts[rowSums(counts[, -1, with = FALSE]) > 0, ]

# Read cohort data
cohort_A <- fread(COHORT_A_FP)
cohort_B <- fread(COHORT_B_FP)

determine_cohort <- function(sample_id) {
  sample_id <- tolower(sample_id)
  
  if (sample_id %in% tolower(cohort_A$`COHORT A`)) {
    return("A")
  } else if (sample_id %in% tolower(cohort_B$`COHORT B`)) {
    return("B")
  } else {
    return("Unknown")
  }
}
# Apply determine_cohort function to create 'cohort' column
sids <- names(counts)[-1]
cohorts <- sapply(sids, determine_cohort)

# Print cohort sizes
printWithTimestamp(paste('Cohort A size:', length(cohorts[cohorts == 'A'])))
printWithTimestamp(paste('Cohort B size:', length(cohorts[cohorts == 'B'])))
printWithTimestamp(paste('Cohort Unknown size:', length(cohorts[cohorts == 'Unknown'])))

# drop Unknown cohort 
cohorts <- cohorts[cohorts != "Unknown"]

# subset the counts to only include the columns that are in the cohorts
preprocessed <- counts[, names(cohorts), with = FALSE]

# Create a data.table of just the cohort labels
colData <- data.table(Sample = names(cohorts), Condition = cohorts)

# Make sure rownames and colnames match
printWithTimestamp(paste('Validating preprocessed data. Valid =', all(names(preprocessed) == colData$Sample)))

# Convert all values to numeric using :=
cols_to_convert <- names(preprocessed)
preprocessed[, (cols_to_convert) := lapply(.SD, as.numeric), .SDcols = cols_to_convert]

printWithTimestamp(paste('[PREPROCESSING FINISHED]. Runtime (s):', Sys.time() - start_time))

# Run DESeq
deseq_start_time <- Sys.time()

printWithTimestamp('Running Deseq')
dds <- DESeqDataSetFromMatrix(countData = preprocessed, colData = colData, design = ~ Condition)
dds <- DESeq(dds)

printWithTimestamp('Running stat summary')
# Extract results
results <- results(dds)

# Display summary
summary(dds)

# Display analysis results
print(results)

printWithTimestamp(paste('[DESEQ FINISHED]. Runtime (s):', Sys.time() - deseq_start_time))
printWithTimestamp(paste('[TOTAL RUNTIME (s)]:', Sys.time() - start_time))
