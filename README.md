# ORIO web-application

This is a web-application designed to work with the [ORIO (Online Resource for
Integrative Omics)](https://github.com/shapiromatron/orio) software package to
create interactive visualizations of the results and allow users to upload
their own custom genomic datasets.

Developer installation instructions are [available](docs/dev.md).

## Website administrative actions

Additional administrator actions for the ORIO website are documented below.

### Adding globally available content

In some cases, we may want to upload feature-lists which are accessible by
any researcher that could be shared. Associated sort-vectors related to these
feature-lists can also be added.

To add global feature-lists, first access the administrator page. Then,
create a new feature-list. Be sure to set the following options:

- Owner: Null (this is important; what makes available to all users)
- Name: anything (but use a consistent prefix like <orio shared>)
- Public: True
- Validated: True

The same process can be applied to sort vectors. Again, use some sort of
common prefix to the name so it it's clear to users that these are shared
content.

### Adding new genomes

To add new genomes, you'll need a chromosome size file. These can be downloaded
using `download_chromosome_sizes` method (found in `orio/assemblies.py`).
After downloading the chromosome size files, on the admin page, create a
genome assembly. Select the appropriate chromosome size file, and give it
a human-friendly name.
