# Getting started with ORIO

ORIO (Online Resource for Integrative Omics) is a powerful tool for integrating next generation sequencing (NGS) data.  The following three vignettes will teach you how to run an ORIO analysis both with public data hosted on ORIO and with personal data that you may upload to the ORIO server.

[Vignette 1: Investigating ChIP-seq and RNA-seq data over RefSeq transcription start sites (TSSs)](#Vignette_1)

[Vignette 2: Investigating ChIP-seq peaks by uploading a feature list](#Vignette_2)

[Vignette 3: Correlating gene expression with histone modification enrichment using a sort vector](#Vignette_3)

[Vignette 4: Validating experimental ChIP-seq data by uploading NGS data to ORIO](#Vignette_4)

<a name="Vignette_1"/>
## Vignette 1: Integrating ChIP-seq and RNA-seq data over RefSeq transcription start sites (TSSs)
</a>

### Creating an account

Before getting started, you will need to create an ORIO account.  Each ORIO account is tied to a personal email address.  When ORIO completes an analysis, a short message will be sent to the user's email account alerting them to the finished analysis.  An account may be created at http://orio.niehs.nih.gov.  Note that any analysis results and uploaded data will be privately associated with your ORIO account unless made public to other users.

### Starting an analysis run

When you first log in, you will be taken to your ORIO dashboard.  Your dashboard is the entry point for all your completed analysis.  At this point, your list of completed analysis will be empty.  Let's change that!  To create a new analysis, click on 'Proceed to run setup.'  This will take you to the 'Create analysis' page.

The first few fields on the 'Create analysis' page are likely self-explanatory.  A `Name` is required for any analysis.  Let's name our analysis 'Mouse TSSs: ES-Bruce4.'  Details may be added to the optional `Description` field for personal bookkeeping.  If the box marked `Public` is checked, the analysis results may be easily shared with others through a common URL address.  The selected `Genomic assembly` should reflect the target model organism and be consistent with the alignment used with considered NGS data.  For `Genomic assembly`, select `mm9`; this should populate the `Feature list` field with sample ORIO feature lists.

ORIO anchors its analysis to a list of genomic coordinates.  These genomic coordinates may be used to represent a biological activity or phenomenon.  For instance, protein binding sites, which may be empirically derived from ChIP-seq data, could be used to represent direct regulation by a transcription factor across the genome.  A collection of these genomic coordinates is referred to as a 'feature list.'

ORIO hosts a number of sample feature lists based on RefSeq gene models.  For our first analysis, we will use a feature list of RefSeq TSSs for mouse.  Select `	mm9_RefSeq_TSSs` from the drop-down menu.

For now, we will ignore the `Sort vector` field.  A sort vector allows for non-NGS data to be integrated into an ORIO analysis.  For details, see Vignette XX.

`Additional settings` allow the user to tweak the genomic windows considered in an ORIO analysis.  ORIO bases its analysis on read coverage values found in genomic windows centered on each genomic coordinate in the selected feature list.  These genomic windows are comprised of equally sized bins.  For default settings, `Anchor`, `Bin start`, `Bin size`, and `Bin number` are set to `Center`, `-2500`, `100`, and `50`, respectively.  This means genomic windows are comprised of 50 100-bp windows starting 2500 bps upstream of the center of each genomic BED entry.  For our sample analysis, we will use the default parameters.  This means a 5-kb genomic window will be created centered on each mouse TSS.

Upon selecting a genomic assembly, `User-uploaded genome datasets` and `ENCODE data selection` headings will be populated with relevant NGS data sets.  Because we have not uploaded any NGS data sets with this new ORIO account, the `User-uploaded genome datasets` heading will be empty.  However, `ENCODE data selection` will be populated with the mm9 ENCODE data hosted on ORIO.  ORIO hosts 4,509 ENCODE datasets for human (hg19) and mouse (mm9).  To manage this large amount of data, ORIO provides intuitive filters to allow focus on relevant data sets.  Let's use the `Cell type` filter to limit the displayed data to a single cell line.  Select `ES-Bruce4`, and click `Apply filters`.  This will add 14 ChIP-seq and RNA-seq data sets to `Available data sets (after filtering)`.  From this list, you can select individual data sets to be added to `Included datasets`.  Click `Add all` to add all 14.  Inspection of the data set list reveals that 2 of these sets are from 'input' ChIP-seq experiments.  These data sets could be very informative in quality control applications, but for our purposes now we'll want to remove them from analysis.  Find the 2 input data sets in the `Included datasets` list ('Input' is included in the data set name), and remove them using the `Remove` button.

At this point, the analysis is now completely set up.  Click `Save`.  This will start processing of the analysis run.  First, ORIO will validate the analysis to make sure the assembly, feature list coordinates, and aligned NGS data are all consistent.  Then ORIO will run the analysis.  You will receive an email when the analysis is complete.

### Visualization of analysis results

When the analysis is complete, it is added to `Completed analysis` on your dashboard.  To access analysis results, first click on the analysis, and then click on `View visualization` on the analysis page.  To access the raw data, you can also download the analysis results and calculated read coverage values in as a zipped folder.  To do this, click `Actions` on the analysis page, and then click `Download zip`.  ORIO will then generate a zip file.  A URL to download the file will be sent to the email address associated with your ORIO account.

### Clustering of NGS data sets

The first visualization view describes the clustering of NGS data sets.  Hierarchical clustering is performed by ORIO considering the pairwise correlation values between each NGS data set.  Results are presented as a heatmap.  Each row and each column corresponds to an individual data set, and points of intersection described the pairwise correlation by Spearman test.  Clustering results are shown using a dendrogram on the left side of the plot; the ordering of heatmap rows and columns also reflect these results.

Dynamic display elements allow for focused investigation of correlation results and raw data.  Numeric correlation values may be found by hovering over fields in the heatmap.  Clicking on an intersection will result in a popup graph displaying the individual data used to determine the correlation values.  The bottom of the page allows for selection of an individual data set.  Upon selecting a data set, a bar chart will display individual correlations with each other NGS data set.  By clicking `Display individual heatmap`, a popup view will appear that describes coverage values for an individual dataset.  Let's view coverage values for an H3K27ac data set by selecting `wgEncodeLicrHistoneEsb4H3k27acME0C57bl6StdSig` and clicking `Display individual heatmap`.

### Display of individual heatmaps

Clicking `Display individual heatmap` will create a popup view of coverage values for an individual dataset.  On the right side of the view, there is heatmap describing coverage values where columns correspond to genomic window bins (genomic position) and rows correspond to genomic features.  On the left, there are two plots displaying average coverage values across features for each bin.  The top plot considers all features.  For the second plot, genomic features are quartiled considering the sort order of the coverage heatmap.  The average coverage values are then displayed for each quartile, and a p-value is reported for an Anderson-Darling test describing differences across quartiles.  Right now, quartiling provides little information: the default view of the heatmap considers the order of the feature list, which for `	mm9_RefSeq_TSSs` is a coordinate sort order.  Quartiling becomes more informative when the heatmap is rank ordered by read coverage values from an independent data set.

A heatmap may be reordered by using the list in the bottom-left corner of the individual heatmap view.  When an independent data set is selected and `Reorder heatmap` is clicked, the heatmap is dynamically reordered by NGS coverage values in descending order.  To test this, let's first sort the heatmap by its own coverage values.  To do this, select `wgEncodeLicrHistoneEsb4H3k27acME0C57bl6StdSig` and then click `Reorder heatmap`.  The heatmap will now be displayed in descending order by read coverage.  These rank-order views allow for investigation of correlations across data sets.  H3K27ac and H3K4me3 are both marks associated with gene activation and are known to correlate.  Select `wgEncodeLicrHistoneEsb4H3k4me3ME0C57bl6StdSig` and click `Reorder heatmap`.  A sort by H3K4me3 read coverage largely preserves the same pattern in the H3K27ac heatmap.

The popup view of individual read coverage may be exited by clicking the 'X' in the upper-right corner.

### Clustering of genomic features

A second display view may be accessed by clicking `Feature clustering` on the analysis visualization page.  This view presents *k*-means clustering results for genomic features.

On the left side of this page, a heatmap displays NGS coverage information for individual clusters.  Rows correspond to genomic features, and columns correspond to total NGS read coverage normalized by upper-quartile values.  Rows are organized by cluster membership; clusters are indicated by vertical bars along the left side of the plot, and the number of members for each cluster can be found by hovering over a given bar.  Columns are organized by hierarchical clustering of NGS data sets.

On the right side of the page, coverage values for cluster centroids are displayed in a two-dimensional plot.  This allows for rapid comparisons of features across clusters.  To facilitate of comparison of individual centroids, the plots of individual centroids are togglable; individual centroids may be added or removed from the plot by clicking on boxes in the legend.

ORIO pre-computes results for *k*-values 2 through 10.  By default, results for *k* = 2 are displayed, but the k-value may be changed through the drop-down menu on the upper-right side of the page.  If changed, the results of the newly selected *k*-value will be automatically displayed.

<a name="Vignette_2"/>
## Vignette 2: Investigating ChIP-seq peaks by uploading a feature list
</a>

ORIO anchors its analysis on a feature list of genomic coordinates.  In order to focus analysis to genomic regions relevant to your interests, you will likely have to provide ORIO with your own feature list.  ORIO accepts feature lists in the common BED format, allowing integration of ORIO with a variety of bioinformatic tools.  Feature lists may then be derived empirically from whole-genome data or inferred by bioinformatic analysis.

Let's add a feature list to ORIO and incorporate this into an analysis.  For our purposes we'll use a publicly available BED file derived from NGS data.  Peaks were called from H3K27ac ChIP-seq data in ES-Bruce4 cells as part of the ENCODE project.  Click [here](https://www.encodeproject.org/files/ENCFF001XWR/@@download/ENCFF001XWR.bed.gz) to download the associated BED file.  Unzip the file before proceeding further.

### Adding a feature list to ORIO

With BED file in hand, let's now add a feature list to ORIO.  Navigate to the ORIO dashboard, and click the `Manage data` button on the right side of the page.  Under `Data management` there are several headings correspond to each ORIO data type.  To begin to add a feature list, click the `Create new` button near the `Feature list` header.

On the `Create feature list` page, name the data entry 'H3K27ac ENCODE' or something similar.  Text may be added to the `Description` field for personal records.  Select `mm9` from the `Genome assembly` drop-down menu.  This particular BED file lacks strand annotation, so turn the `Stranded` toggle to off.  Next, click `Choose File` under `Dataset`.  Navigate to the downloaded and unzipped BED file, and open it.  Finally, click `Save`.  Now the feature list will be added to the `Feature list` drop-down menu on the `Create analysis` page and may be used in an ORIO analysis.

Added feature lists may be modified and/or deleted on the `Data management` page.  To do this, click on the name of desired list under the `Feature lists` heading.  On the feature list page, then click on `Actions` button to bring up a drop-down menu with `Update` and `Delete` options.

(for details about starting an analysis run, see [Vignette 1](#Vignette_1))

### Inspection of analysis results

<a name="Vignette_3"/>
## Vignette 3: Correlating gene expression with histone modification enrichment using a sort vector
</a>

ORIO allows for integration of non-NGS data as well!  This is performed using an ORIO sort vector.  A sort vector is tab-delimited text file where the first column gives the name of genomic feature and the second gives a value.  Any sort vector may be accepted by ORIO as long as a value is given for each entry in a feature list.

Let's perform an analysis using a sort vector.  To do this, we first need to upload a sort vector to ORIO.  Then we need to setup and run the analysis.

For this example, we will provide a sort vector for you.  This sort vector describes gene expression values for each mouse RefSeq TSS based on RNA-seq data in Bruce-4 embryonic stem cells.  These values were computed using Cufflinks.  The sort vector may be downloaded [here]().

If you examine the sort vector, you'll see that it is a two-column tab-delimited text file.  This sort vector is designed to be used with the mouse RefSeq TSS feature list hosted on ORIO.  The left column contains TSS feature names; the right contains FPKM values.  A thorough examination would reveal that there is an FPKM value for each TSS in the ORIO feature list.

### Adding a sort vector to ORIO

Sort vectors may be uploaded to ORIO in much the same way as a feature list.  On the ORIO dashboard, click `Manage data`.  On the `Data management` page, the `Sort vectors` heading is on the lower-left; click on `Create new` button to begin adding the sort vector.

On the `Create sort vector` page, give the sort vector an informative name, such as "ES Bruce-4 FPKM."  You may add information to the `Description` field for your personal use.  Specify the associated feature list (mm9_RefSeq_TSSs) in the `Feature list` drop-down menu.  Note that if the feature list selected has different feature entries than the sort vector, ORIO validation of the sort vector will fail.  Click `Choose file` and open the downloaded sort vector.  Finally, click `Save`.  The sort vector will then be added to the `Data management` page.  To modify and/or delete the sort vector, click the name of the sort vector, and use the `Actions` drop-down menu.

An analysis may now be created using the sort vector.  To do this, click `Proceed to run setup` on the ORIO dashboard.  Selecting `mm9` from the `Genome assembly` will populate the `Feature list` drop-down menu.  After selecting feature list `mm9_RefSeq_TSSs`, the sort vector may then selected from the `Sort vector` list.  Now NGS data sets may be selected, and the analysis saved.  For this analysis, select all ENCODE data sets for ES-Bruce4 cells using the `Cell type` filter.  For additional details regarding setting up an analysis, see [Vignette 1]().

### Visualization of sort vector results

For a sort vector analysis, NGS data are clustered by their similarity to the sort vector.  When the sort vector is FPKM values describing gene expression, NGS data will be grouped by coincidence with highly expressed genes.  In the `Dataset clustering` view of an analysis with a sort vector, correlations are reported in a heatmap on a bin-by-bin basis for each data set.  By performing correlations considering individual bins, the orientation of correlating features may be found relative to feature list entries.  Like analyses without sort vectors, raw data used to generate correlation values may be found by clicking on individual heatmap cells.

Correlations may also be investigated in the individual heatmap view.  As an example, let's check coverage values with histone modification H3K27ac.  Select `wgEncodeLicrHistoneEsb4H3k27acME0C57bl6StdSig` from the data set list in the lower-left corner, and click `Display individual heatmap`.  H3K27ac is known to be a mark of activated genes and should correlate with gene expression values.  In the individual heatmap view, `<sort vector order>` is an available option.  Select this, and click `Reorder heatmap`.  The reordered H3K27ac heatmap clearly shows descending signal intensity, reflecting the correlation of this mark with gene expression.

<a name="Vignette_4"/>
## Vignette 4: Validating experimental ChIP-seq data by uploading NGS data to ORIO
</a>

ORIO is a great resource for performing quality control of experimental data sets.  ORIO allows for rapid comparison of similar data vectors.  In this example, we'll compare a ChIP-seq experiments with similar antibodies across different cell lines.  Let's treat a publicly available ENCODE data set as if it was recently derived and being initially evaluated.  This data is from a ChIP-seq experiment with a CTCF antibody in mouse ES-Bruce4 cells.  Click [here]() to download the data.

The downloaded data is a bigWig file containing read coverage information for the ChIP-seq experiment in question.  In order to flexibly accommodate a variety of NGS data types, ORIO considers read coverage in analysis.  As input, ORIO accepts coverage information in bigWig format.  The downloaded data is already in in bigWig format, but bigWig coverage files may be easily generated for other NGS experiments.  We recommend using the `coverage` function of [bedtools](http://bedtools.readthedocs.io/en/latest/) to initially generate a coverage bedGraph file from BAM alignments and then converting the bedGraph file to bigWig format using [bedGraphToBigWig](http://hgdownload.cse.ucsc.edu/admin/exe/linux.x86_64/bedGraphToBigWig).

Though a compressed file, bigWig files can be quite large, oftentimes exceeding 100 MB.  For this reason, we require uploads of bigWig files by HTTPS.  In order to upload a bigWig file to ORIO, that file must be hosted on a server and publicly accessible for download.  This may sound complicated, but there are a number of services available online for cloud-based storage that may also be used to host your files.  For instance, [Dropbox](https://www.dropbox.com/) may be used to host files, and its free storage accounts provide ample space for hosting most bigWig files.  Let's walk through adding a bigWig file to ORIO via Dropbox.

### Adding a NGS data to ORIO through Dropbox

If you don't already have a Dropbox account, set one up.  Again, the free account provides enough storage for our purposes.  Add the downloaded bigWig to your stored files.  On the `Files` page, click the `Share` button for the uploaded bigWig, and in the resulting popup, click `Copy link`.  A URL link will be copied to your clipboard.  This link will tell ORIO where to access your file so it can be downloaded.

Now navigate to the ORIO dashboard, and head to the `Data management` page by clicking `Manage data`.  Personal NGS data is maintained under the `User datasets` heading.  Click `Create new` to begin to add a user dataset.  Give the data set an informative name, and optionally add text to the `Description` field for your personal records.  Specify `ChipSeq` as the experiment type; ORIO treats all data types the same, but this field helps to organize your own data.  Select `mm9` from the `Genome assembly` drop-down list, and leave `Stranded` unchecked.

We will now add information from Dropbox to the `URL` field.  Paste the URL into the text box.  The URL will have the format `https://www.dropbox.com/s/XXX/GSM723004_RenLab-CTCF-MEF.bigwig?dl=0` where "XXX" is a series of alphanumeric characters.  The URL needs to be modified slightly to allow for downloading.  First, replace `www.dropbox.com` with `dl.dropboxusercontent.com`.  Then, remove the `?dl=0` tag from the end of the URL.  The final URL will be of the format `https://dl.dropboxusercontent.com/s/XXX/GSM723004_RenLab-CTCF-MEF.bigwig`.  Once the URL is correctly modified, click `Save`, and ORIO will begin downloading the file.

Wait for ORIO to finish downloading the file; you will receive a popup notification when the file has been downloaded and has passed validation.  Navigate to the dashboard, and click `Proceed to run setup` to start creating an analysis run.  Give the analysis an informative name, and add optional description text for your personal records.  Select `mm9` from the `Genome assembly` drop-down list.  We'll use `mm9 RefSeq TSSs` as the feature list for this analysis.  Upon selecting mm9 as the genome assembly, the uploaded data set should have been added to the `User-uploaded genome datasets` list.  Click the box under the `Include?` column to include the data set in the analysis.  A short name may be given for the data set to be used as a label in the visualized results.

We will next select ENCODE data sets to compare with our uploaded data.  We will compare our data set to all ENCODE ChIP-seq datasets where a CTCF antibody was used.  This will allow us to rapidly compare the uploaded data against similar datasets.  To filter the ENCODE data to relevant data sets, we will set the `Data type` and `Antibody` filters to `ChipSeq` and `CTCF`, respectively (the antibody list will need to expanded by clicking the `+` sign near the `Antibody` header).  After the filters are selected, click `Apply filters` and `Add all` to use all ENCODE CTCF data sets in this analysis.  Note that this will include associated input control files; comparisons with these controls will be important in data validation.  Finally, click `Save`.  ORIO will now run the analysis, and when finished, you will receive a notification email.

### Inspection of analysis results

CTCF binding will be different from cell type to cell type, but there will be significant overlap between different cells.  This is reflected in the analysis results.  In the heatmap of NGS data set correlation values, there is a strong grouping of CTCF data sets.  Importantly, there is a separate grouping of input controls, implying observed signal above background.  Amongst the public CTCF data is the uploaded data set.  The uploaded data may be investigated further in the individual heatmap view.  A rank-order sort by another CTCF data set creates a heatmap organized by descending coverage values.
