#!/usr/bin/env python
import os
import sys
import click
import subprocess

from .base import Validator, get_validateFiles_path


class BigWigValidator(Validator):

    def __init__(self, bigwig, chrom_sizes_file):

        super().__init__()

        assert os.path.exists(bigwig)
        assert os.path.exists(chrom_sizes_file)

        self.bigwig = bigwig
        self.chrom_sizes_file = chrom_sizes_file

    def validate(self):
        executable = get_validateFiles_path()
        proc = subprocess.Popen([
            executable,
            "-chromInfo=" + self.chrom_sizes_file,
            "-type=bigWig",
            self.bigwig
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        output, errors = proc.communicate()
        output = output.decode(encoding='UTF-8')
        errors = errors.decode(encoding='UTF-8')

        if output != 'Error count 0\n':
            outputs = output.splitlines()
            self.add_errors(outputs)

        if errors:
            errors = errors.splitlines()
            self.add_errors(errors)


@click.command()
@click.argument('bigwig')
@click.argument('chrom_sizes_file')
def cli(bigwig, chrom_sizes_file):
    """
    Validate bigwig file.
    """
    validator = BigWigValidator(bigwig, chrom_sizes_file)
    validator.validate()
    sys.stdout.write(validator.display_errors())


if __name__ == '__main__':
    cli()
